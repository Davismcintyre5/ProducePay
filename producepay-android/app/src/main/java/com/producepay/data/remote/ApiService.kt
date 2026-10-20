package com.producepay.data.remote
import com.producepay.data.models.*
import retrofit2.Response
import retrofit2.http.*
interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<LoginResponse>>
    @GET("auth/me")
    suspend fun getMe(): Response<ApiResponse<Map<String, User>>>
    @GET("deliveries")
    suspend fun getDeliveries(): Response<ApiResponse<List<Delivery>>>
    @POST("deliveries")
    suspend fun createDelivery(@Body request: CreateDeliveryRequest): Response<ApiResponse<Map<String, Any>>>
    @GET("payments")
    suspend fun getPayments(): Response<ApiResponse<List<Payment>>>
    @GET("reports/dashboard")
    suspend fun getDashboard(): Response<ApiResponse<Map<String, Any>>>
}
