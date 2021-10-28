type JWTToken = string

interface LoginResponse {
    success: boolean
    data: {
        token: JWTToken
    }
}

interface RegisterResponse {
    success?: boolean
    error?: string

}

interface UploadResponse {
    success: boolean
}