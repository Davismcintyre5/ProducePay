package com.producepay.util
class TokenManager {
    private var token: String? = null
    fun getToken(): String? = token
    fun setToken(newToken: String) { token = newToken }
}
