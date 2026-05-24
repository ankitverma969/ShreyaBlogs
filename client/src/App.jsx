import { lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';

const Home = lazy(() => import('./pages/Home.jsx'));
const Explore = lazy(() => import('./pages/Explore.jsx'));
const CategoryPage = lazy(() => import('./pages/CategoryPage.jsx'));
const SearchResults = lazy(() => import('./pages/SearchResults.jsx'));
const Bookmarks = lazy(() => import('./pages/Bookmarks.jsx'));
const ReadingHistory = lazy(() => import('./pages/ReadingHistory.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.jsx'));
const SinglePost = lazy(() => import('./pages/SinglePost.jsx'));
const About = lazy(() => import('./pages/About.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const AdminLogin = lazy(() => import('./pages/AdminLogin.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const CreatePost = lazy(() => import('./pages/CreatePost.jsx'));
const ManagePosts = lazy(() => import('./pages/ManagePosts.jsx'));
const Analytics = lazy(() => import('./pages/Analytics.jsx'));
const CommentsModeration = lazy(() => import('./pages/CommentsModeration.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen message="Opening the diary..." />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/category/:category" element={<CategoryPage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/history" element={<ReadingHistory />} />
            <Route path="/post/:slug" element={<SinglePost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/v1/adminShreyaTiwari/login" element={<AdminLogin />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/v1/adminShreyaTiwari" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="create" element={<CreatePost />} />
              <Route path="posts" element={<ManagePosts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="comments" element={<CommentsModeration />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;
