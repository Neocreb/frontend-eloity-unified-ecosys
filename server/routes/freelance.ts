import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireTier2, triggerKYCIfNeeded } from '../middleware/tierAccessControl.js';
import { logger } from '../utils/logger.js';
import { db } from '../../server/enhanced-index.js';
import { freelance_projects as freelance_jobs, freelance_profiles as profiles } from '../../shared/freelance-schema.js';
import { freelance_proposals } from '../../shared/freelance-schema.js';
import { eq, and, or, desc, asc, like, sql, count } from 'drizzle-orm';
import { freelance_stats } from '../../shared/freelance-schema.js';

const router = express.Router();

// Get all jobs (with filtering, pagination, search)
router.get('/jobs', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      budget_min, 
      budget_max, 
      project_type,
      experience_level,
      search,
      sort = 'recent'
    } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build the query
    let jobsQuery = db.select().from(freelance_jobs);
    let countQuery = db.select({ count: count() }).from(freelance_jobs);

    // Apply filters
    if (category && category !== 'all') {
      jobsQuery = jobsQuery.where(eq(freelance_jobs.category, category as string));
      countQuery = countQuery.where(eq(freelance_jobs.category, category as string));
    }

    if (project_type && project_type !== 'all') {
      jobsQuery = jobsQuery.where(eq(freelance_jobs.budget_type, project_type as string));
      countQuery = countQuery.where(eq(freelance_jobs.budget_type, project_type as string));
    }

    if (experience_level && experience_level !== 'all') {
      jobsQuery = jobsQuery.where(eq(freelance_jobs.experience_level, experience_level as string));
      countQuery = countQuery.where(eq(freelance_jobs.experience_level, experience_level as string));
    }

    if (budget_min) {
      jobsQuery = jobsQuery.where(sql`${freelance_jobs.budget_min} >= ${budget_min}`);
      countQuery = countQuery.where(sql`${freelance_jobs.budget_min} >= ${budget_min}`);
    }

    if (budget_max) {
      jobsQuery = jobsQuery.where(sql`${freelance_jobs.budget_max} <= ${budget_max}`);
      countQuery = countQuery.where(sql`${freelance_jobs.budget_max} <= ${budget_max}`);
    }

    if (search) {
      jobsQuery = jobsQuery.where(or(
        like(freelance_jobs.title, `%${search}%`),
        like(freelance_jobs.description, `%${search}%`),
        sql`EXISTS (SELECT 1 FROM unnest(${freelance_jobs.skills_required}) AS skill WHERE skill ILIKE '%${search}%')`
      ));
      countQuery = countQuery.where(or(
        like(freelance_jobs.title, `%${search}%`),
        like(freelance_jobs.description, `%${search}%`),
        sql`EXISTS (SELECT 1 FROM unnest(${freelance_jobs.skills_required}) AS skill WHERE skill ILIKE '%${search}%')`
      ));
    }

    // Apply sorting
    switch (sort) {
      case 'budget_high':
        jobsQuery = jobsQuery.orderBy(desc(freelance_jobs.budget_max));
        break;
      case 'budget_low':
        jobsQuery = jobsQuery.orderBy(asc(freelance_jobs.budget_min));
        break;
      case 'urgent':
        jobsQuery = jobsQuery.orderBy(desc(freelance_jobs.urgent));
        break;
      case 'recent':
      default:
        jobsQuery = jobsQuery.orderBy(desc(freelance_jobs.created_at));
        break;
    }

    // Apply pagination
    jobsQuery = jobsQuery.limit(parseInt(limit as string)).offset(offset);

    // Execute queries
    const jobsResult = await jobsQuery.execute();
    const countResult = await countQuery.execute();
    const total = countResult[0]?.count || 0;

    // Get client information for each job
    const clientIds = [...new Set(jobsResult.map(j => j.client_id))];
    const clientsResult = await db.select().from(profiles).where(sql`${profiles.user_id} in ${clientIds}`).execute();
    const clientsMap = clientsResult.reduce((acc, client) => {
      acc[client.user_id] = client;
      return acc;
    }, {});

    const jobsData = jobsResult.map(job => ({
      id: job.id,
      client: {
        id: job.client_id,
        username: clientsMap[job.client_id]?.username || 'Unknown',
        displayName: clientsMap[job.client_id]?.full_name || clientsMap[job.client_id]?.username || 'Unknown',
        avatar: clientsMap[job.client_id]?.avatar_url || '/placeholder.svg',
        rating: clientsMap[job.client_id]?.rating || 0,
        verified: clientsMap[job.client_id]?.is_verified || false,
        total_spent: clientsMap[job.client_id]?.total_spent || 0,
        jobs_posted: clientsMap[job.client_id]?.jobs_posted || 0
      },
      title: job.title,
      description: job.description,
      category: job.category,
      subcategory: job.subcategory,
      project_type: job.project_type,
      budget: job.budget,
      currency: job.currency,
      experience_level: job.experience_level,
      estimated_duration: job.estimated_duration,
      skills_required: job.skills_required ? JSON.parse(job.skills_required) : [],
      location_requirement: job.location_requirement,
      timezone_preference: job.timezone_preference,
      proposals_count: job.proposals_count || 0,
      status: job.status,
      urgency: job.urgency,
      created_at: job.created_at,
      updated_at: job.updated_at,
      deadline: job.deadline
    }));

    const result = {
      data: jobsData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      },
      filters: {
        categories: ['Web Development', 'Design', 'Writing', 'Marketing'],
        experience_levels: ['entry', 'intermediate', 'expert'],
        project_types: ['fixed', 'hourly']
      }
    };

    logger.info('Jobs fetched', { page, limit, category, count: jobsData.length });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job by ID
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get job from database
    const jobResult = await db.select().from(freelance_jobs).where(eq(freelance_jobs.id, id)).execute();
    const jobData = jobResult[0];

    if (!jobData) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Get client information
    const clientResult = await db.select().from(profiles).where(eq(profiles.user_id, jobData.client_id)).execute();
    const clientData = clientResult[0];

    const job = {
      id: jobData.id,
      client: {
        id: jobData.client_id,
        username: clientData?.username || 'Unknown',
        displayName: clientData?.full_name || clientData?.username || 'Unknown',
        avatar: clientData?.avatar_url || '/placeholder.svg',
        rating: clientData?.rating || 0,
        verified: clientData?.is_verified || false,
        total_spent: clientData?.total_spent || 0,
        jobs_posted: clientData?.jobs_posted || 0,
        member_since: clientData?.created_at || new Date().toISOString()
      },
      title: jobData.title,
      description: jobData.description,
      category: jobData.category,
      subcategory: jobData.subcategory,
      project_type: jobData.project_type,
      budget: jobData.budget,
      currency: jobData.currency,
      experience_level: jobData.experience_level,
      estimated_duration: jobData.estimated_duration,
      skills_required: jobData.skills_required ? JSON.parse(jobData.skills_required) : [],
      location_requirement: jobData.location_requirement,
      timezone_preference: jobData.timezone_preference,
      proposals_count: jobData.proposals_count || 0,
      status: jobData.status,
      urgency: jobData.urgency,
      attachments: jobData.attachments ? JSON.parse(jobData.attachments) : [],
      milestones: jobData.milestones ? JSON.parse(jobData.milestones) : [],
      created_at: jobData.created_at,
      updated_at: jobData.updated_at,
      deadline: jobData.deadline
    };

    logger.info('Job fetched', { jobId: id });
    res.json(job);
  } catch (error) {
    logger.error('Error fetching job:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create new job
// Requires Tier 2 verification for job posting
router.post('/jobs', requireTier2(), triggerKYCIfNeeded('freelance_offer'), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      project_type,
      budget,
      currency = 'USD',
      experience_level,
      estimated_duration,
      skills_required = [],
      location_requirement = 'remote',
      timezone_preference,
      urgency = 'normal',
      attachments = [],
      milestones = []
    } = req.body;

    const userId = req.userId;

    // Create job in database
    const jobData = {
      client_id: userId,
      title,
      description,
      category,
      subcategory,
      project_type,
      budget,
      currency,
      experience_level,
      estimated_duration,
      skills_required: JSON.stringify(skills_required),
      location_requirement,
      timezone_preference,
      urgency,
      attachments: JSON.stringify(attachments),
      milestones: JSON.stringify(milestones),
      status: 'open',
      proposals_count: 0,
      created_at: new Date(),
      updated_at: new Date(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default to 7 days from now
    };

    const result = await db.insert(freelance_jobs).values(jobData).returning().execute();

    logger.info('Job created', { jobId: result[0].id, userId });
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
// Requires Tier 2 verification
router.put('/jobs/:id', requireTier2(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if job belongs to user
    const jobResult = await db.select().from(freelance_jobs).where(and(eq(freelance_jobs.id, id), eq(freelance_jobs.client_id, userId as string))).execute();
    
    if (jobResult.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this job' });
    }

    const {
      title,
      description,
      category,
      subcategory,
      budget_type: project_type,
      budget_min: budget,
      currency,
      experience_level,
      project_duration: estimated_duration,
      skills_required,
      location_requirement,
      location: timezone_preference,
      urgent: urgency,
      status,
      attachments,
      milestones
    } = req.body;

    // Update job in database
    const updateData = {
      title,
      description,
      category,
      subcategory,
      budget_type: project_type,
      budget_min: budget,
      currency,
      experience_level,
      project_duration: estimated_duration,
      ...(skills_required && { skills_required: JSON.stringify(skills_required) }),
      location_requirement,
      location: timezone_preference,
      urgent: urgency,
      status,
      ...(attachments && { attachments: JSON.stringify(attachments) }),
      ...(milestones && { milestones: JSON.stringify(milestones) }),
      updated_at: new Date()
    };

    const result = await db.update(freelance_jobs).set(updateData).where(eq(freelance_jobs.id, id)).returning().execute();

    logger.info('Job updated', { jobId: id, userId });
    res.json(result[0]);
  } catch (error) {
    logger.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if job belongs to user
    const jobResult = await db.select().from(freelance_jobs).where(and(eq(freelance_jobs.id, id), eq(freelance_jobs.client_id, userId as string))).execute();
    
    if (jobResult.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this job' });
    }

    // Delete job from database
    await db.delete(freelance_jobs).where(eq(freelance_jobs.id, id)).execute();

    logger.info('Job deleted', { jobId: id, userId });
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    logger.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Get jobs by client
router.get('/jobs/client/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get jobs from database
    const jobsResult = await db.select().from(freelance_jobs)
      .where(eq(freelance_jobs.client_id, clientId))
      .orderBy(desc(freelance_jobs.created_at))
      .limit(parseInt(limit as string))
      .offset(offset)
      .execute();

    // Get client information
    const clientResult = await db.select().from(profiles).where(eq(profiles.user_id, clientId)).execute();
    const clientData = clientResult[0];

    const jobsData = jobsResult.map(job => ({
      id: job.id,
      client: {
        id: clientId,
        username: clientData?.username || 'Unknown',
        displayName: clientData?.full_name || clientData?.username || 'Unknown',
        avatar: clientData?.avatar_url || '/placeholder.svg',
        rating: clientData?.rating || 0,
        verified: clientData?.is_verified || false
      },
      title: job.title,
      description: job.description,
      category: job.category,
      project_type: job.project_type,
      budget: job.budget,
      currency: job.currency,
      experience_level: job.experience_level,
      estimated_duration: job.estimated_duration,
      skills_required: job.skills_required ? JSON.parse(job.skills_required) : [],
      location_requirement: job.location_requirement,
      timezone_preference: job.timezone_preference,
      proposals_count: job.proposals_count || 0,
      status: job.status,
      urgency: job.urgency,
      created_at: job.created_at,
      updated_at: job.updated_at,
      deadline: job.deadline
    }));

    const countResult = await db.select({ count: count() }).from(freelance_jobs).where(eq(freelance_jobs.client_id, clientId)).execute();
    const total = countResult[0]?.count || 0;

    const result = {
      data: jobsData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    };

    logger.info('Client jobs fetched', { clientId, count: jobsData.length });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching client jobs:', error);
    res.status(500).json({ error: 'Failed to fetch client jobs' });
  }
});

// Submit proposal for a job
router.post('/proposals', authenticateToken, async (req, res) => {
  try {
    const { jobId, cover_letter, hourly_rate, estimated_hours, attachments = [] } = req.body;
    const userId = req.userId;

    // Check if job exists and is open
    const jobResult = await db.select().from(freelance_jobs).where(and(eq(freelance_jobs.id, jobId), eq(freelance_jobs.status, 'open'))).execute();
    const jobData = jobResult[0];

    if (!jobData) {
      return res.status(404).json({ error: 'Job not found or not open' });
    }

    // Check if user has already submitted a proposal
    const existingProposal = await db.select().from(freelance_proposals)
      .where(and(eq(freelance_proposals.project_id, jobId), eq(freelance_proposals.freelancer_id, userId as string)))
      .execute();

    if (existingProposal.length > 0) {
      return res.status(400).json({ error: 'You have already submitted a proposal for this job' });
    }

    // Create proposal in database
    const proposalData = {
      job_id: jobId,
      freelancer_id: userId,
      cover_letter,
      hourly_rate,
      estimated_hours,
      attachments: JSON.stringify(attachments),
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.insert(freelance_proposals).values(proposalData).returning().execute();

    // Update job proposal count
    await db.update(freelance_jobs)
      .set({ applications_count: sql`${freelance_jobs.applications_count} + 1`, updated_at: new Date() })
      .where(eq(freelance_jobs.id, jobId))
      .execute();

    logger.info('Proposal submitted', { proposalId: result[0].id, jobId, userId });
    res.status(201).json(result[0]);
  } catch (error) {
    logger.error('Error submitting proposal:', error);
    res.status(500).json({ error: 'Failed to submit proposal' });
  }
});

// Get proposals for a job
router.get('/proposals/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    // Check if job belongs to user
    const jobResult = await db.select().from(freelance_jobs).where(and(eq(freelance_jobs.id, jobId), eq(freelance_jobs.client_id, userId as string))).execute();
    
    if (jobResult.length === 0) {
      return res.status(403).json({ error: 'Not authorized to view proposals for this job' });
    }

    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Get proposals from database
    const proposalsResult = await db.select().from(freelance_proposals)
      .where(eq(freelance_proposals.project_id, jobId))
      .orderBy(desc(freelance_proposals.created_at))
      .limit(parseInt(limit as string))
      .offset(offset)
      .execute();

    // Get freelancer information for each proposal
    const freelancerIds = [...new Set(proposalsResult.map(p => p.freelancer_id))];
    const freelancersResult = await db.select().from(profiles).where(sql`${profiles.user_id} in ${freelancerIds}`).execute();
    const freelancersMap = freelancersResult.reduce((acc, freelancer) => {
      acc[freelancer.user_id] = freelancer;
      return acc;
    }, {});

    const proposalsData = proposalsResult.map(proposal => ({
      id: proposal.id,
      job_id: proposal.job_id,
      freelancer: {
        id: proposal.freelancer_id,
        username: freelancersMap[proposal.freelancer_id]?.username || 'Unknown',
        displayName: freelancersMap[proposal.freelancer_id]?.full_name || freelancersMap[proposal.freelancer_id]?.username || 'Unknown',
        avatar: freelancersMap[proposal.freelancer_id]?.avatar_url || '/placeholder.svg',
        rating: freelancersMap[proposal.freelancer_id]?.rating || 0,
        verified: freelancersMap[proposal.freelancer_id]?.is_verified || false
      },
      cover_letter: proposal.cover_letter,
      hourly_rate: proposal.hourly_rate,
      estimated_hours: proposal.estimated_hours,
      attachments: proposal.attachments ? JSON.parse(proposal.attachments) : [],
      status: proposal.status,
      created_at: proposal.created_at,
      updated_at: proposal.updated_at
    }));

    const countResult = await db.select({ count: count() }).from(freelance_proposals).where(eq(freelance_proposals.project_id, jobId)).execute();
    const total = countResult[0]?.count || 0;

    const result = {
      data: proposalsData,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    };

    logger.info('Proposals fetched', { jobId, count: proposalsData.length });
    res.json(result);
  } catch (error) {
    logger.error('Error fetching proposals:', error);
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
});

// Get freelancer stats
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Try to get stats from freelance_stats table first
    const statsResult = await db.select().from(freelance_stats).where(eq(freelance_stats.user_id, userId)).execute();
    
    if (statsResult.length > 0) {
      const stats = statsResult[0];
      return res.json({
        data: {
          totalProjects: stats.total_projects || 0,
          completedProjects: stats.completed_projects || 0,
          totalEarnings: parseFloat(stats.total_earnings?.toString() || "0"),
          averageRating: parseFloat(stats.average_rating?.toString() || "0"),
          responseTime: stats.response_time || 0,
          successRate: parseFloat(stats.success_rate?.toString() || "0"),
          repeatClients: stats.repeat_clients || 0
        }
      });
    }

    // Fallback: Calculate stats from projects if freelance_stats table is empty
    logger.warn("Freelance stats not found in freelance_stats table, calculating from projects...");
    
    // Get freelancer's projects
    const projectsResult = await db.select().from(freelance_jobs)
      .where(eq(freelance_jobs.freelancer_id, userId))
      .execute();

    // Calculate stats
    const completedProjects = projectsResult.filter(p => p.status === 'completed').length;
    const totalProjects = projectsResult.length;
    const totalEarnings = projectsResult.reduce((sum, project) => {
      return sum + (project.budget_min ? parseFloat(project.budget_min.toString()) : 0);
    }, 0);

    // For now, we'll use placeholder values for other stats
    // In a real implementation, these would come from the database
    const result = {
      data: {
        totalProjects,
        completedProjects,
        totalEarnings,
        averageRating: 4.5, // Placeholder
        responseTime: 2, // Placeholder (hours)
        successRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
        repeatClients: 0 // Placeholder
      }
    };

    res.json(result);
  } catch (error) {
    logger.error('Error fetching freelancer stats:', error);
    res.status(500).json({ error: 'Failed to fetch freelancer stats' });
  }
});

export default router;
