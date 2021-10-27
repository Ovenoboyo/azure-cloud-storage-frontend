type JWTToken = string

interface LoginResponse {
    success: boolean
    data: {
        token: JWTToken
    }
}

interface UploadResponse {
    success: boolean
}