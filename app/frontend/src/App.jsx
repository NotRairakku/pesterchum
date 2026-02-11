import { useEffect, useState } from "react";
import TopBar from "./modules/TopBar.jsx";
import Profile from "./modules/Profile.jsx";
import Auth from "./modules/Auth.jsx";
import Loader from "./modules/Loader.jsx";
import Client from "./modules/Client.jsx";
import style from "../../../assets/styles/app.module.css";
import {HasSession, GetUserData, GetUserFriends, GetFriendsRequests} from "../wailsjs/go/auth/Service.js";

import default_photo from "../../../assets/dev/john.jpg";


export default function App() {
    const [appStatus, setAppStatus] = useState("loading");
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);
    const [friendsRequests, setFriendsRequests] = useState([]);

    const loadUser = async () => {
        console.log("[App] loadUser start");
        try {
            const res = await GetUserData();

            const userData = {
                Username: res.username?.trim() || "",
                Photo: res.photo || default_photo,
                Description: res.description || "",
                Mood: res.mood?.toLowerCase() || "chummy",
                Color: res.color || "#ffffff",
                Birthdate: res.birthdate || "",
                Address: res.address || "",
            };

            await loadUserFriends();
            await loadFriendsRequests();

            console.log("[App] User loaded:", userData);
            setUser(userData);
            setAppStatus("client");
        } catch (err) {
            console.error("[App] loadUser error user", err);
            setUser(null);
            setAppStatus("auth");
        }
    };

    const loadUserFriends = async () => {
        try {
            const res = await GetUserFriends();
            console.log("GetUserFriends:", res);
            const friendsData = (res || []).map(f => ({
                id: f.ID || f.FriendId,
                username: f.Name || f.FriendName,
                mood: (f.Mood || f.FriendMood || "chummy").toLowerCase(),
            }));
            setFriends(friendsData);
        } catch (e) {
            console.error("loadUserFriends error", e);
            setFriends([]);
        }
    };

    const loadFriendsRequests = async () => {
        try {
            const res = await GetFriendsRequests();
            console.log("GetUserFriends:", res);
            setFriendsRequests(res || []);
        } catch (e) {
            console.error("loadFriendsRequests error", e);
            setFriendsRequests([]);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const ok = await HasSession();
                if (!ok) {
                    setAppStatus("auth");
                    return;
                }
                await loadUser();

            } catch {
                setAppStatus("auth");
            }
        };

        init();
    }, []);

    const STATUS_MAP = {
        login: <Loader />,
        client: <Client
            user={user}
            setUser={setUser}
            friends={friends} />,
        profile: <Profile
            setAppStatus={setAppStatus}
            user={user}
            setUser={setUser}
            friends={friends}
            setFriends={setFriends}
            friendsRequests={friendsRequests}
            setFriendsRequests={setFriendsRequests}/>,
        auth: <Auth
            loadUser={loadUser}/>,
    }

    return (
        <div className={style.app}>
            <TopBar
                setAppStatus={setAppStatus}
                user={user} />
            <div className={style.app__container}>
                {STATUS_MAP[appStatus]}
            </div>
        </div>
    );
}