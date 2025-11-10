// src/components/Social/InstagramFeed.jsx
import React, { useEffect, useState } from "react";

const InstagramFeed = () => {
  const [latestPost, setLatestPost] = useState(null);

  useEffect(() => {
    const fetchInstagramPost = async () => {
      try {
        const token = import.meta.env.VITE_IG_ACCESS_TOKEN;
        const userId = import.meta.env.VITE_IG_USER_ID;

        const url = `https://graph.instagram.com/${userId}/media?fields=id,caption,media_url,permalink,media_type,timestamp&access_token=${token}&limit=1`;

        const res = await fetch(url);
        const data = await res.json();
        if (data?.data?.length > 0) {
          setLatestPost(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching Instagram post:", error);
      }
    };

    fetchInstagramPost();
  }, []);

  if (!latestPost) return null;

  return (
    <div
      className="w-full overflow-hidden cursor-pointer my-6"
      onClick={() => window.open(latestPost.permalink, "_blank")}
    >
      <div className="relative h-[300px] md:h-[450px] w-full animate-slideUp">
        <img
          src={latestPost.media_url}
          alt="Instagram Post"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-50 text-white p-3 text-sm font-semibold w-full text-center">
          {latestPost.caption?.slice(0, 100)}...
        </div>
      </div>
    </div>
  );
};

export default InstagramFeed;
