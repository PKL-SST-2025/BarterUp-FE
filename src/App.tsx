import './App.css'
// src/App.tsx

import { Router, Route} from "@solidjs/router";
import { createEffect } from 'solid-js';
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Profile from './pages/Profile';
// import Analytics from './pages/ProfileAnalytics';
import Test from './pages/Test';
import Messages from './pages/Messages';
import PostPage from './pages/PostPage'; 

function RedirectToDashboard() {
  createEffect(() => { window.location.replace('/dashboard'); });
  return null;
}

export default function App() {
  return (
    <Router>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/signup/personal" component={RedirectToDashboard} />
        <Route path="/signup/upload" component={RedirectToDashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/profile" component={Profile} />
        {/* <Route path="/analytics" component={Analytics} /> */}
        <Route path="/test" component={Test} />
        <Route path="/messages" component={Messages} />
        <Route path="/post" component={PostPage} /> 
    </Router>
  );
}

