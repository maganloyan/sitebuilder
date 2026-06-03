import React from 'react';
import { Link } from 'react-router-dom';
import NotFoundImage from "../assets/4043.svg"; // Adjust the path as necessary

interface NotFoundProps {
  imageSrc?: string;
  title?: string;
  description?: string;
  linkText?: string;
  linkTo?: string;
}

const NotFound: React.FC<NotFoundProps> = ({
  imageSrc = NotFoundImage, // Default image
  title = "Page Not Found",
  description = "Oops! The page you are looking for does not exist.",
  linkText = "Go Back Home",
  linkTo = "/home",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <img
        src={imageSrc}
        alt="404 Not Found"
        className="h-72 w-full max-w-md"
      />
      <h1 className="mt-6 text-2xl font-bold text-primary">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <Link
        to={linkTo}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-accent hover:text-accent-foreground"
      >
        {linkText}
      </Link>
    </div>
  );
};

export default NotFound;
