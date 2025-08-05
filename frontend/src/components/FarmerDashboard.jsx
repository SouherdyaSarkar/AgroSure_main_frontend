import { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Leaf,
  Download,
  FileText,
  TrendingUp,
  Cloud,
  Sun,
  CloudRain,
  LogOut,
  BarChart3,
  Calendar,
  CreditCard,
  Shield,
  MessageCircle
} from "lucide-react";
import { useParams } from 'react-router-dom';
import YieldPredictionForm from "./YieldPredictionForm"; // Assuming this is already non-ShadCN or will be converted
import YieldResults from "./YieldResult";             // Assuming this is already non-ShadCN or will be converted
import LoanApplication from "./loanApplication";
import InsuranceClaim from "./insuranceClaim";
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../utils/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import PastReports from "./pastRecords";
import KisaanSaathi from "./kisaanSaathi";
import {Menu} from 'lucide-react';
import axios from 'axios';

const FarmerDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [yieldResults, setYieldResults] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [farmingNews,setFarmingNews] = useState();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    uid: '',
    name: '',
    email: '',
    totalLand : 0,
    crops: [],
    locationLat: '',
    locationLong: '',
    isSmallFarmer : false,
    phone: '',
    aadhar: '',
  });

  const {id} = useParams();

  const [isMobile, setIsMobile] = useState(false); // Start with false, will be set correctly in useEffect
  
  const [displayData, setDisplayData] = useState({
    user: {
    uid: '' || 'd7m74KoesWRw9bdXceJboC7vbUu1',
    name: '' || 'Souherdya Sarkar',
    email: '' || 'souherdya@gmail.com',
    totalLand : 0 || 10,
    crops: [] || ['Wheat', 'Rice', 'Maize'],
    locationLat: '' || 22.5726,
    locationLong: '' || 88.3639,
    isSmallFarmer : false || true,
      phone: '' || '9876543210',
      aadhar: '' || '123456789012',
    }
  });

  const getDateRange = () => {
  const today = new Date();
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(today.getDate() - 14);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Months are 0-based
    const day = (`0${date.getDate()}`).slice(-2);
    return `${year}-${month}-${day}`;
  };

  return {
    endDate: formatDate(today),
    startDate: formatDate(fourteenDaysAgo),
  };
}

  useEffect(()=>{
    console.log("Starting news API call...");
    const {endDate, startDate} = getDateRange();

    axios.get(`https://newsdata.io/api/1/latest?apikey=${import.meta.env.VITE_NEWS_API}&q=indian%20agriculture`)
      .then((response)=>{
        console.log("News API response received:", response);
        setNewsData(response.data);
        console.log("News data : ", response.data);
      })
      .catch((error) => {
        console.error("News API error:", error);
        console.error("Error details:", error.response?.data || error.message);
      });
  },[]);
  
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleYieldPrediction = (results) => {
    setYieldResults(results);
    setActiveSection('results');
  };

  useEffect(() => {
  let hasFetched = false; // ✅ Block re-entry

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (hasFetched) return; // ✅ Only allow first call
    hasFetched = true;

    const uidToUse = user ? user.uid : id;

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/dashboard/${uidToUse}`);
      const data = await response.json();
      setUserData(data);
      setDisplayData(data);
    } catch (error) {
      console.error('Error fetching farmer data:', error);

      try {
        const dummy_data = JSON.parse(localStorage.getItem("mock_userData"));
        if (dummy_data) {
          setDisplayData(dummy_data);
          console.log("Using mock data from localStorage.");
        } else {
          const fallbackData = {
            user: {
              uid: 'd7m74KoesWRw9bdXceJboC7vbUu1',
              name: 'Souherdya Sarkar',
              email: 'souherdya@gmail.com',
              totalLand: 5,
              crops: ['Wheat', 'Rice', 'Maize'],
              locationLat: 22.5726,
              locationLong: 88.3639,
              isSmallFarmer: true,
              phone: '9876543210',
              aadhar: '123456789012',
            }
          };
          setDisplayData(fallbackData);
          localStorage.setItem("mock_userData", JSON.stringify(fallbackData));
        }
      } catch (localStorageError) {
        console.error('LocalStorage fallback failed:', localStorageError);
      }
    }
  });

  return () => {
    unsubscribe();
    console.log('Unsubscribed from Firebase Auth listener.');
  };
}, []);

function getRelativeTime(pubDate) {
  const now = new Date();
  const published = new Date(pubDate);
  const diffMs = now - published;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return `Just now`;
}

// Safely generate the farmingNews array from newsData
useEffect(() => {
  if (!newsData || !newsData.results) return;

  const mappedNews = newsData.results.slice(0, 10).map((item) => ({
    title: item.title || "Some_random_title",
    time: getRelativeTime(item.pubDate),
    type: newsData.source_name || "general",
  }));

  setFarmingNews(mappedNews); // Assuming you want to use state here
}, [newsData]);


  const weatherData = {
    today: { temp: "28°C", condition: "Sunny", icon: Sun },
    tomorrow: { temp: "26°C", condition: "Cloudy", icon: Cloud },
    dayAfter: { temp: "24°C", condition: "Rainy", icon: CloudRain }
  };

  return (
    <div className="min-h-screen bg-agricultural-soft-sand">
      
      {/* Top Navigation */}
      <nav className="bg-white border-b border-agricultural-stone-gray/20 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Leaf className="h-8 w-8 text-agricultural-forest-green" />
            <span className="text-xl font-bold text-agricultural-soil-brown">AgroSure</span>
          </div>
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md 
              text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none 
              disabled:opacity-50 border border-agricultural-stone-gray bg-white text-agricultural-soil-brown h-10 px-4 py-2 
              hover:bg-agricultural-soft-sand"
            >
              <Menu className="h-4 w-4" />
            </button>
            {/* Replaces Button component */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md 
              text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none 
              disabled:opacity-50 border border-agricultural-stone-gray bg-white text-agricultural-soil-brown h-10 px-4 py-2 
              hover:bg-agricultural-stone-gray/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} bg-white border-r border-agricultural-stone-gray/20 overflow-auto transition-all duration-300 ease-in-out`}>
          <div className={`${sidebarCollapsed ? 'opacity-0' : 'opacity-100'} p-6 overflow-y-auto transition-opacity duration-300`}>
            {/* User Profile */}
          <div className="text-center mb-8">
            {/* Replaces Avatar component */}
            <div className="relative flex h-20 w-20 shrink-0 overflow-hidden rounded-full mx-auto mb-4">
              {/* Replaces AvatarFallback */}
              <span className="flex h-full w-full items-center justify-center rounded-full bg-agricultural-forest-green text-white text-xl">
                {displayData?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
              {/* If you had an AvatarImage, it would go here as an <img> tag */}
              {/* <img className="aspect-square h-full w-full" alt="User Avatar" src="..." /> */}
            </div>
            <h2 className="text-xl font-semibold text-agricultural-soil-brown mb-1">
              {displayData?.user?.name}
            </h2>
            <p className="text-agricultural-stone-gray text-sm mb-3">
              ID: FARMER#1001
            </p>

            {/* User Stats */}
            <div className="space-y-3">
              <div className="bg-agricultural-soft-sand rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-agricultural-stone-gray">Acres Owned:</span>
                  <span className="font-semibold text-agricultural-forest-green">{displayData?.user?.totalLand || 0} acres</span>
                </div>
              </div>

              <div className="bg-agricultural-soft-sand rounded-lg p-3">
                <div className="text-sm mb-2 text-agricultural-stone-gray">Crops Farmed:</div>
                <div className="flex flex-wrap gap-1">
                  {displayData?.user?.crops?.map((crop, index) => (
                    <span key={index} className="inline-flex items-center rounded-full border bg-agricultural-crop-green/10 px-2.5 py-0.5 text-xs font-semibold text-agricultural-crop-green transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                      {crop}
                    </span>
                  )) || <span className="text-agricultural-stone-gray text-xs">No crops added</span>}
                </div>
              </div>

              <div className="bg-agricultural-soft-sand rounded-lg p-3">
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 text-agricultural-stone-gray mr-2" />
                  <span className="text-agricultural-soil-brown">
                    {displayData?.user?.locationLat && displayData?.user?.locationLong 
                      ? `${displayData?.user?.locationLat}, ${displayData?.user?.locationLong}` 
                      : 'Location not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Replaces Separator component */}
          <div className="shrink-0 bg-agricultural-stone-gray/20 h-[1px] w-full mb-6" role="separator" />

          {/* Navigation Menu */}
          <div className="space-y-2">
            <button
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full justify-start ${
                activeSection === 'dashboard'
                  ? 'bg-agricultural-forest-green text-white hover:bg-agricultural-forest-green/90' // Default variant styling
                  : 'text-agricultural-soil-brown hover:bg-agricultural-soft-sand hover:text-agricultural-soil-brown' // Ghost variant styling
              }`}
              onClick={() => {
                setActiveSection('dashboard');
              }}
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Dashboard
            </button>

            <button
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full justify-start ${
                activeSection === 'prediction'
                  ? 'bg-agricultural-forest-green text-white hover:bg-agricultural-forest-green/90'
                  : 'text-agricultural-soil-brown hover:bg-agricultural-soft-sand hover:text-agricultural-soil-brown'
              }`}
              onClick={() => {
                if(isMobile){
                  setSidebarCollapsed(true);
                }
                setActiveSection('prediction');
              }}
            >
              <TrendingUp className="h-4 w-4 mr-3" />
              New Prediction
            </button>

            <button
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full justify-start ${
                activeSection === 'loan-application'
                  ? 'bg-agricultural-forest-green text-white hover:bg-agricultural-forest-green/90'
                  : 'text-agricultural-soil-brown hover:bg-agricultural-soft-sand hover:text-agricultural-soil-brown'
              }`}
              onClick={() => {
                if(isMobile){
                  setSidebarCollapsed(true);
                }
                setActiveSection('loan-application');
              }}
            >
              <CreditCard className="h-4 w-4 mr-3" />
              Loan Application
            </button>

            <button
              className={`inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full justify-start ${
                activeSection === 'insurance-claim'
                  ? 'bg-agricultural-forest-green text-white hover:bg-agricultural-forest-green/90'
                  : 'text-agricultural-soil-brown hover:bg-agricultural-soft-sand hover:text-agricultural-soil-brown'
              }`}
              onClick={() => {
                if(isMobile){
                  setSidebarCollapsed(true);
                }
                setActiveSection('insurance-claim');
              }}
            >
              <Shield className="h-4 w-4 mr-3" />
              Insurance Claim
            </button>

            <button
              className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium
               ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
               focus-visible:ring-ring focus-visible:ring-offset-2 
               disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full 
               justify-start text-agricultural-soil-brown hover:bg-agricultural-soft-sand 
               hover:text-agricultural-soil-brown"
              onClick={() => {
                if(isMobile){
                  setSidebarCollapsed(true);
                }
                setActiveSection('past-reports');
              }}
            >
              <FileText className="h-4 w-4 mr-3" />
              Past Reports
            </button>

            <button
              className="inline-flex items-center whitespace-nowrap rounded-md text-sm font-medium
               ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 
               focus-visible:ring-ring focus-visible:ring-offset-2 
               disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 w-full 
               justify-start text-agricultural-soil-brown hover:bg-agricultural-soft-sand 
               hover:text-agricultural-soil-brown"
              onClick={() => {
                if(isMobile){
                  setSidebarCollapsed(true);
                }
                setActiveSection('kisaan-saathi');
              }}
            >
              <MessageCircle className="h-4 w-4 mr-3" />
              Kisaan Saathi
            </button>
          </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'dashboard' && (
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-agricultural-soil-brown mb-2">
                  Welcome back, {displayData?.user?.name?.split(' ')[0] || 'User'}!
                </h1>
                <p className="text-agricultural-stone-gray">
                  Here's what's happening with your farm today
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Farming Feed */}
                <div className="lg:col-span-2">
                  {/* Replaces Card component */}
                  <div className="rounded-lg border bg-white text-card-foreground shadow-sm warm-shadow border-agricultural-stone-gray/20">
                    {/* Replaces CardHeader */}
                    <div className="flex flex-col space-y-1.5 p-6">
                      {/* Replaces CardTitle */}
                      <h3 className="flex items-center text-2xl font-semibold leading-none tracking-tight text-agricultural-soil-brown">
                        <Calendar className="h-5 w-5 mr-2" />
                        Farming Feed
                      </h3>
                    </div>
                    {/* Replaces CardContent */}
                    <div className="p-6 pt-0 max-h-[40vh] overflow-y-auto space-y-4">
                      {farmingNews?.map((news, index) => (
                        <div key={index} className="border-b border-agricultural-stone-gray/20 last:border-0 pb-4 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-agricultural-soil-brown text-sm">
                              {news.title}
                            </h3>
                            <span className="text-xs text-agricultural-stone-gray">{news.time}</span>
                          </div>
                          {/* Replaces Badge component */}
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                              news.type === 'price-update' ? 'border-agricultural-crop-green text-agricultural-crop-green' :
                              news.type === 'policy' ? 'border-agricultural-harvest-gold text-agricultural-harvest-gold' :
                              'border-agricultural-drought-orange text-agricultural-drought-orange'
                            }`}
                          >
                            {news.type.replace('-', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {/* Replaces Card component */}
                  <div className="mt-6 rounded-lg border bg-white text-card-foreground shadow-sm warm-shadow border-agricultural-stone-gray/20">
                    {/* Replaces CardHeader */}
                    <div className="flex flex-col space-y-1.5 p-6">
                      {/* Replaces CardTitle */}
                      <h3 className="text-2xl font-semibold leading-none tracking-tight text-agricultural-soil-brown">Quick Actions</h3>
                    </div>
                    {/* Replaces CardContent */}
                    <div className="p-6 pt-0">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Replaces Button component */}
                        <button
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-agricultural-forest-green hover:bg-agricultural-crop-green text-white h-auto py-4 flex-col space-y-2"
                          onClick={() => setActiveSection('prediction')}
                        >
                          <TrendingUp className="h-6 w-6" />
                          <span>New Yield Prediction</span>
                        </button>
                        {/* Replaces Button component */}
                        <button
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-agricultural-stone-gray bg-white text-agricultural-soil-brown h-auto py-4 flex-col space-y-2 hover:bg-agricultural-soft-sand"
                          onClick={() => setActiveSection('loan-application')}
                        >
                          <Download className="h-6 w-6" />
                          <span>Apply for Loan</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weather Widget */}
                <div className="space-y-6">
                  {/* Replaces Card component */}
                  <div className="rounded-lg border bg-white text-card-foreground shadow-sm warm-shadow border-agricultural-stone-gray/20">
                    {/* Replaces CardHeader */}
                    <div className="flex flex-col space-y-1.5 p-6">
                      {/* Replaces CardTitle */}
                      <h3 className="flex items-center text-2xl font-semibold leading-none tracking-tight text-agricultural-soil-brown">
                        <Cloud className="h-5 w-5 mr-2" />
                        Weather Forecast
                      </h3>
                    </div>
                    {/* Replaces CardContent */}
                    <div className="p-6 pt-0 space-y-4">
                      {Object.entries(weatherData).map(([day, data], index) => (
                        <div key={day} className="flex items-center justify-between p-3 bg-agricultural-soft-sand rounded-lg">
                          <div className="flex items-center space-x-3">
                            <data.icon className="h-5 w-5 text-agricultural-forest-green" />
                            <div>
                              <div className="font-medium text-agricultural-soil-brown text-sm">
                                {day === 'today' ? 'Today' : day === 'tomorrow' ? 'Tomorrow' : 'Day After'}
                              </div>
                              <div className="text-xs text-agricultural-stone-gray">{data.condition}</div>
                            </div>
                          </div>
                          <div className="font-semibold text-agricultural-soil-brown">{data.temp}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Farm Summary */}
                  {/* Replaces Card component */}
                  <div className="rounded-lg border bg-white text-card-foreground shadow-sm warm-shadow border-agricultural-stone-gray/20">
                    {/* Replaces CardHeader */}
                    <div className="flex flex-col space-y-1.5 p-6">
                      {/* Replaces CardTitle */}
                      <h3 className="text-2xl font-semibold leading-none tracking-tight text-agricultural-soil-brown">Farm Summary</h3>
                    </div>
                    {/* Replaces CardContent */}
                    <div className="p-6 pt-0 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-agricultural-stone-gray">Total Land:</span>
                          <span className="font-semibold text-agricultural-soil-brown">{displayData?.user?.totalLand || 0} acres</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-agricultural-stone-gray">Active Crops:</span>
                          <span className="font-semibold text-agricultural-soil-brown">{displayData?.user?.crops?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-agricultural-stone-gray">Reports Generated:</span>
                          <span className="font-semibold text-agricultural-crop-green">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-agricultural-stone-gray">Success Rate:</span>
                          <span className="font-semibold text-agricultural-crop-green">94%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'prediction' && (
            <div className="p-8">
              <YieldPredictionForm 
                user={displayData?.user || {}} 
                onPredictionComplete={handleYieldPrediction}
              />
            </div>
          )}

          {activeSection === 'loan-application' && (
            <LoanApplication 
              user={displayData?.user || {}} 
              onBack={() => setActiveSection('dashboard')}
            />
          )}

          {activeSection === 'insurance-claim' && (
            <InsuranceClaim 
              user={displayData?.user || {}} 
              onBack={() => setActiveSection('dashboard')}
            />
          )}

          {activeSection === 'results' && yieldResults && (
            <div className="p-8">
              <YieldResults 
                results={yieldResults} 
                user={displayData?.user || {}}
                onBackToDashboard={() => setActiveSection('dashboard')}
              />
            </div>
          )}
          {activeSection === 'kisaan-saathi' && (
            <KisaanSaathi 
              onBack={() => setActiveSection('dashboard')}
            />
          )}

          {activeSection === 'past-reports' && (
            <PastReports 
              user={displayData?.user || {}} 
              onBack={() => setActiveSection('dashboard')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;