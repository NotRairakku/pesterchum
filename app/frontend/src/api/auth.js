import {
    Login,
    Register,
    Logout
} from "../../wailsjs/go/wails/AuthAPI";

export async function login(username, password) {
    return await Login(username, password);
}

export async function register(username, password) {
    await Register(username, password);
}

export async function logout() {
    await Logout();
}
