import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EnhancedTikTokBattle from '@/components/battles/EnhancedTikTokBattle';

const BattlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-black">
      <EnhancedTikTokBattle 
        battleId={id}
        onExit={() => navigate('/app/videos')}
      />
    </div>
  );
};

export default BattlePage;