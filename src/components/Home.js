import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


const Home = () => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const options = {
      method: 'GET',
      headers: { accept: 'application/json', 'x-api-key': '3e736dba7151eb8de28a065916dc9d70' }
    };

    fetch('https://api.unleashnfts.com/api/v2/nft/collection/metadata?sort_order=desc&offset=0&limit=30', options)
      .then(res => res.json())
      .then(res => {
        const imageUrls = res.data.filter(item => item.image_url && !item.image_url.includes('unknown')).map(item => item.image_url);
        setImages(imageUrls);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="home">
      <h1 className="welcome-message">Welcome to the World of NFT Collection and NFT Marketplace</h1>
      <div className="links">
        <Link to="/nftmarketplaceoverview" className="link">NFT Marketplace</Link>
        <Link to="/nftcollection" className="link">NFT Collection</Link>
      </div>
      <div className="image-gallery">
        {images.map((url, index) => (
          <img key={index} src={url} alt={`NFT ${index}`} className="gallery-image" />
        ))}
      </div>
    </div>
  );
};

export default Home;