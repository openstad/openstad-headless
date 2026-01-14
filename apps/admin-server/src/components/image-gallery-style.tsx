import React from "react";

const ImageGalleryStyle = () => {
  return (
    <style jsx global>{`
      .image-gallery.tile > *:not(.image-container){
       opacity: 0;
       transition: 0.3s ease;
       pointer-events: none;
      }
      
      .image-gallery .image-container {
       position: relative;
       cursor: pointer;
       display: flex;
       justify-content: center;
       align-items: center;
       width: 100%;
       height: 100%;
      }
      
      .image-gallery.tile:hover > *:not(.image-container){
       opacity: 1;
       pointer-events: all;
      }
      
      .image-gallery.tile {
       transition: 0.3s ease;
      }
      
      .image-gallery .image-container:before {
       position: absolute;
       width: 100%;
       height: 100%;
       top: 0;
       left: 0;
       background-color: rgba(0, 0, 0, 0.3);
       content: '';
       opacity: 0;
       transition: 0.3s ease;
       pointer-events: none;
      }
      
      .image-gallery .image-container:hover:before {
       opacity: 1;
      }
      
      .image-gallery.tile .arrow-container{
       position: absolute;
       bottom: 30px;
       left: 50%;
       transform: translateX(-50%);
       width: 100%;
       padding: 0;
       grid-template-columns: 30px 30px;
       height: 0;
       overflow: visible;
      }
      
      .image-gallery.tile .arrow-container svg {
       background-color: rgb(21, 112, 239);
       color: white;
       width: 30px;
       height: 30px;
       padding: 6px;
       transition: 0.3s ease;
      }
      
      .image-gallery.tile .arrow-container svg:hover {
       background-color: rgb(241, 245, 248);
       color: rgb(21, 112, 239);
       padding: 6px;
      }
      
      .image-gallery.tile > button {
       background-color: rgb(21, 112, 239);
       padding: 5px;
       border-radius: 0;
       width: 30px;
       height: 30px;
      }
      
      .image-gallery.tile > button > svg {
       color: white;
       padding: 3px;
      }
      
      .image-gallery.tile > button:hover {
       background-color: white;
       padding: 5px;
       border-radius: 0;
       width: 30px;
       height: 30px;
      }
      
      .image-gallery.tile > button:hover > svg {
       color: rgb(21, 112, 239);
       padding: 3px;
      }
      
      .image-gallery:not(.tile) > button,
      .image-gallery:not(.tile) > .arrow-container {
       display: none;
      }
    `}</style>
  );
}

export default ImageGalleryStyle;