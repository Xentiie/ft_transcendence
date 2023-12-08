import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { THREE_App } from './main';
import './index.css'
import Cookies, { CookieAttributes } from 'js-cookie';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

function get_tokens() {
  const urlParams = new URLSearchParams(window.location.search)
  const access_token = urlParams.get('access_token')
  const refresh_token = urlParams.get('refresh_token')
  if (access_token && refresh_token) {
    const newURL = window.location.href.replace(window.location.search, '')
    window.history.replaceState({}, document.title, newURL)
  }
  return {
    access_token: access_token,
    refresh_token: refresh_token
  }
}

function App() {

  const [showProfile, setShowProfile] = useState(false)
  const [showChat, setShowChat] = useState(false)

  //MERDE POUR FIX LES COOKIES
  useEffect(() => {
    const tokens = get_tokens()
    console.log(tokens)
    if (!tokens.access_token || !tokens.refresh_token)
      return
    Cookies.set("access_token", tokens.access_token)
    Cookies.set("refresh_token", tokens.refresh_token)
  }, [])
  //MERDE POUR FIX LES COOKIES

  return (
    <div>
      <THREE_App>
      </THREE_App>
    </div>
  )
}

root.render(
  //<React.StrictMode>
  <App />
  //	<Chat width={window.innerWidth / 2} height={window.innerHeight / 2}/>
  //</React.StrictMode>
);
