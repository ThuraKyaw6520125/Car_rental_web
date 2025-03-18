const Card = ({ id, title, description, ownername, imageUrl, buttonText, onClick }) => {
    return (
      <div className="max-w-sm bg-white rounded-2xl shadow-md overflow-hidden border">
        {imageUrl && <img className="w-full h-48 object-cover" src={imageUrl} alt={title} />}
        <div className="p-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-600 mt-2">{description}</p>
          <p className="text-gray-600 mt-2">{ownername}</p>
          {buttonText && (
            <button
              onClick={onClick} // Open modal when clicked
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {buttonText}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  export default Card;
  
  