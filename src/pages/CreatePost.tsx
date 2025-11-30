import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePostFlow from "@/components/feed/CreatePostFlow";

const CreatePost = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    navigate("/app/feed");
  };

  useEffect(() => {
    if (!isOpen) {
      navigate("/app/feed");
    }
  }, [isOpen, navigate]);

  return (
    <CreatePostFlow
      isOpen={isOpen}
      onClose={handleClose}
    />
  );
};

export default CreatePost;
