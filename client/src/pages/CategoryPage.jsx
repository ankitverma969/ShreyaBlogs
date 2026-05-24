import { useParams } from 'react-router-dom';
import Explore from './Explore.jsx';

function CategoryPage() {
  const { category } = useParams();
  return <Explore key={category} initialCategory={category} />;
}

export default CategoryPage;
