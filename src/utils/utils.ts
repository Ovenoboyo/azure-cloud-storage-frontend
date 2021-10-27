import { BASE_URL } from "./constants";

export async function post(url: string, data: any, token?: string, stringify = true) {
    const headers: any = {}
    if (token) {
        headers["authorization"] = 'Bearer ' + token
    }

    return fetch(BASE_URL + url, {
        method: 'POST',
        headers: headers,
        body: stringify ? JSON.stringify(data) : data,
    })
}

export async function get(url: string, token?: string) {
    const headers: any = {}
    if (token) {
        headers["authorization"] = 'Bearer ' + token
    }

    return fetch(BASE_URL + url, {
        method: 'GET',
        headers: headers,
    })
}