export type MemberRole = "owner" | "admin" | "member";

export interface MockMember {
  id: string;
  name: string;
  avatar: string;
  role: MemberRole;
  joinedAt: string;
}

export interface MockComment {
  id: string;
  author: MockMember;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: MockComment[];
}

export interface MockPost {
  id: string;
  author: MockMember;
  content: string;
  images?: string[];
  video?: string;
  timestamp: string;
  likes: number;
  comments: MockComment[];
  isLiked: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
}

export interface MockEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location?: string;
  attendees: number;
  isAttending: boolean;
  cover?: string;
}

const baseProfiles: Array<{ name: string; avatar: string }> = [
  {
    name: "Amina Yusuf",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Diego Ramos",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Sophia Chen",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Kwame Boateng",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Lena Fischer",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Noah Williams",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Maya Patel",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Jonah Okoro",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Claire Dubois",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Haruto Sato",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Zoe Martins",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Finn Gallagher",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
];

const postTemplates: string[] = [
  "Welcome to all the new members who joined this week! Drop a hello and let us know what you're working on.",
  "We're planning a live Q&A session next Friday. Share the questions you want answered in the comments.",
  "Just wrapped up a collaboration sprint with amazing results. Posting highlights later today!",
  "Reminder: community guidelines keep this space helpful. Please review them before posting.",
  "What are the biggest challenges you're facing this quarter? Let's crowdsource some solutions.",
  "We just published a knowledge base update with fresh templates and resources—check it out!",
  "Our mentorship program is looking for volunteers. Comment if you're interested in helping newcomers.",
  "Weekly wins thread! Celebrate something you're proud of and cheer others on.",
];

const commentTemplates: string[] = [
  "This is incredibly helpful—thanks for organizing it!",
  "I ran into a similar challenge last month. Happy to share what worked for me.",
  "Excited for this session! Adding my questions now.",
  "Great reminder. The guidelines make sure everyone's voice is heard.",
  "Count me in! I've been looking for a way to contribute more to the community.",
  "Appreciate the transparency here. Looking forward to the recap.",
];

const imagePool: string[] = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529338296731-c4280a44fc47?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=80",
];

const eventTemplates: Array<{
  title: string;
  description: string;
  location?: string;
  cover: string;
}> = [
  {
    title: "Product Design Sprint",
    description:
      "Collaborative workshop to prototype and validate a new feature flow in five focused days.",
    location: "Remote",
    cover:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Community Demo Day",
    description:
      "Showcase recent projects from members, followed by feedback circles and networking.",
    location: "Cape Town Hub",
    cover:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "AI Ethics Roundtable",
    description:
      "Panel discussion exploring responsible AI deployment and practical governance frameworks.",
    location: "Hybrid",
    cover:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Creator Collaboration Meetup",
    description:
      "In-person gathering to plan cross-platform content strategies and revenue experiments.",
    location: "Nairobi Creator Lab",
    cover:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Marketplace Seller Masterclass",
    description:
      "Deep dive into storefront optimization, conversion analytics, and fulfillment automation.",
    location: "Virtual",
    cover:
      "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1600&q=80",
  },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash === 0 ? 1 : Math.abs(hash);
}

function createRng(seedValue: number): () => number {
  let seed = seedValue >>> 0;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMemberPool(groupId: string, size: number): MockMember[] {
  const poolSize = Math.max(size, baseProfiles.length);
  const rng = createRng(hashString(`members:${groupId}`));
  const offset = Math.floor(rng() * baseProfiles.length);

  return Array.from({ length: poolSize }).map((_, index) => {
    const profile = baseProfiles[(index + offset) % baseProfiles.length];
    const daysAgo = Math.floor(rng() * 540) + index * 7;
    const role: MemberRole =
      index === 0
        ? "owner"
        : index <= 2
        ? "admin"
        : rng() > 0.88
        ? "admin"
        : "member";

    return {
      id: `${groupId}-member-${index + 1}`,
      name: profile.name,
      avatar: profile.avatar,
      role,
      joinedAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}

export function generateMockMembers(groupId: string, count: number): MockMember[] {
  const safeCount = Math.max(1, Math.floor(count));
  const pool = buildMemberPool(groupId, safeCount);
  return pool.slice(0, safeCount);
}

function pickMember(members: MockMember[], rng: () => number, excludeId?: string): MockMember {
  const available = excludeId
    ? members.filter((member) => member.id !== excludeId)
    : members;
  if (available.length === 0) {
    return members[0];
  }
  const index = Math.floor(rng() * available.length) % available.length;
  return available[index];
}

function generateComments(
  groupId: string,
  members: MockMember[],
  rng: () => number,
  maxComments: number,
): MockComment[] {
  const count = Math.floor(rng() * (maxComments + 1));
  return Array.from({ length: count }).map((_, index) => {
    const author = pickMember(members, rng);
    const template = commentTemplates[(index + Math.floor(rng() * commentTemplates.length)) % commentTemplates.length];
    const hoursAgo = Math.floor(rng() * 120) + index * 3;

    return {
      id: `${groupId}-comment-${author.id}-${index}`,
      author,
      content: template,
      timestamp: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
      likes: Math.floor(rng() * 24),
      isLiked: false,
    };
  });
}

export function generateMockPosts(groupId: string, count: number): MockPost[] {
  const safeCount = Math.max(1, Math.floor(count));
  const rng = createRng(hashString(`posts:${groupId}`));
  const members = buildMemberPool(groupId, Math.max(safeCount * 2, 8));

  return Array.from({ length: safeCount }).map((_, index) => {
    const author = pickMember(members, rng);
    const template = postTemplates[(index + Math.floor(rng() * postTemplates.length)) % postTemplates.length];
    const daysAgo = Math.floor(rng() * 20) + index;
    const includeImages = rng() > 0.55;
    const imageCount = includeImages ? 1 + Math.floor(rng() * 2) : 0;
    const images = includeImages
      ? Array.from({ length: imageCount }).map((__, imgIndex) => {
          const src = imagePool[(index + imgIndex + Math.floor(rng() * imagePool.length)) % imagePool.length];
          return `${src}`;
        })
      : undefined;

    const comments = generateComments(groupId, members, rng, 3);

    return {
      id: `${groupId}-post-${index + 1}`,
      author,
      content: template,
      images,
      timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      likes: 18 + Math.floor(rng() * 420),
      comments,
      isLiked: false,
      isPinned: index === 0 && rng() > 0.4,
      isEdited: rng() > 0.85,
    };
  });
}

function formatEventTime(hours: number, minutes: number): string {
  const normalizedHours = ((hours % 12) + 12) % 12 || 12;
  const suffix = hours >= 12 ? "PM" : "AM";
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${normalizedHours}:${paddedMinutes} ${suffix}`;
}

export function generateMockEvents(groupId: string, count: number): MockEvent[] {
  const safeCount = Math.max(1, Math.floor(count));
  const rng = createRng(hashString(`events:${groupId}`));

  return Array.from({ length: safeCount }).map((_, index) => {
    const template = eventTemplates[(index + Math.floor(rng() * eventTemplates.length)) % eventTemplates.length];
    const daysAhead = Math.floor(rng() * 45) + index * 3;
    const hours = 9 + Math.floor(rng() * 9);
    const minutes = Math.floor(rng() * 4) * 15;

    return {
      id: `${groupId}-event-${index + 1}`,
      title: template.title,
      description: template.description,
      date: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString(),
      time: formatEventTime(hours, minutes),
      location: template.location,
      attendees: 32 + Math.floor(rng() * 890),
      isAttending: rng() > 0.6,
      cover: template.cover,
    };
  });
}
