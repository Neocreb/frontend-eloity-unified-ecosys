-- Create get_audience_demographics function
CREATE OR REPLACE FUNCTION public.get_audience_demographics(user_id uuid)
RETURNS TABLE(demographic text, value numeric) AS $$
BEGIN
  -- Return engagement metrics from user_analytics table
  RETURN QUERY
  SELECT 
    'total_followers'::text as demographic,
    COALESCE(ua.followers_count, 0)::numeric as value
  FROM public.user_analytics ua
  WHERE ua.user_id = get_audience_demographics.user_id
  ORDER BY ua.date DESC
  LIMIT 1
  
  UNION ALL
  
  SELECT 
    'engagement_rate'::text as demographic,
    COALESCE(ua.engagement_rate, 0)::numeric as value
  FROM public.user_analytics ua
  WHERE ua.user_id = get_audience_demographics.user_id
  ORDER BY ua.date DESC
  LIMIT 1
  
  UNION ALL
  
  SELECT 
    'active_minutes'::text as demographic,
    COALESCE(ua.active_minutes, 0)::numeric as value
  FROM public.user_analytics ua
  WHERE ua.user_id = get_audience_demographics.user_id
  ORDER BY ua.date DESC
  LIMIT 1
  
  UNION ALL
  
  SELECT 
    'posts_count'::text as demographic,
    COALESCE(ua.posts_count, 0)::numeric as value
  FROM public.user_analytics ua
  WHERE ua.user_id = get_audience_demographics.user_id
  ORDER BY ua.date DESC
  LIMIT 1
  
  UNION ALL
  
  SELECT 
    'likes_received'::text as demographic,
    COALESCE(ua.likes_received, 0)::numeric as value
  FROM public.user_analytics ua
  WHERE ua.user_id = get_audience_demographics.user_id
  ORDER BY ua.date DESC
  LIMIT 1
  
  UNION ALL
  
  SELECT 
    'comments_received'::text as demographic,
    COALESCE(ua.comments_received, 0)::numeric as value
  FROM public.user_analytics ua
  WHERE ua.user_id = get_audience_demographics.user_id
  ORDER BY ua.date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_audience_demographics(uuid) TO authenticated;