package com.producepay.ui.viewmodels
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.producepay.data.local.OutboxDao
import com.producepay.data.local.OutboxEntity
import com.producepay.data.models.Delivery
echo com.producepay.data.models.FarmerSnapshot
import com.producepay.data.models.Payment
import com.producepay.data.models.User
import com.producepay.data.remote.ApiService
import com.producepay.util.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val api: ApiService,
    private val tokenManager: TokenManager
) : ViewModel() {
    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()
    private val _user = MutableStateFlow<User?>(null)
    val user = _user.asStateFlow()

    fun login(email: String, pass: String, onSuccess: () -> Unit) {
        viewModelScope.launch {
            _isLoading.value = true; _error.value = null
            try {
                val res = api.login(com.producepay.data.models.LoginRequest(email, pass))
                if (res.isSuccessful && res.body()?.data != null) {
                    val data = res.body()!!.data
                    tokenManager.setToken(data.accessToken)
                    _user.value = data.user
                    onSuccess()
                } else {
                    _error.value = "Invalid credentials"
                }
            } catch (e: Exception) { _error.value = e.message ?: "Network error" }
            finally { _isLoading.value = false }
        }
    }
}

@HiltViewModel
class DashboardViewModel @Inject constructor(private val api: ApiService) : ViewModel() {
    private val _stats = MutableStateFlow<Map<String, Any>?>(null)
    val stats = _stats.asStateFlow()
    fun loadStats() {
        viewModelScope.launch {
            try {
                val res = api.getDashboard()
                if (res.isSuccessful) _stats.value = res.body()?.data?.get("stats") as? Map<String, Any>
            } catch (e: Exception) {}
        }
    }
}

@HiltViewModel
class DeliveriesViewModel @Inject constructor(
    private val api: ApiService,
    private val outboxDao: OutboxDao,
    private val repository: com.producepay.data.repo.DeliveryRepository
) : ViewModel() {
    private val _deliveries = MutableStateFlow<List<Delivery>>(emptyList())
    val deliveries = _deliveries.asStateFlow()
    private val _outbox = MutableStateFlow<List<OutboxEntity>>(emptyList())
    val outbox = _outbox.asStateFlow()

    fun loadDeliveries() {
        viewModelScope.launch {
            try {
                val res = api.getDeliveries()
                if (res.isSuccessful) _deliveries.value = res.body()?.data ?: emptyList()
            } catch (e: Exception) {}
            _outbox.value = outboxDao.getAll()
        }
    }

    fun saveDelivery(farmerId: String, weight: Double, notes: String?) {
        viewModelScope.launch {
            repository.recordDelivery(farmerId, weight, java.time.Instant.now().toString(), notes)
            _outbox.value = outboxDao.getAll()
        }
    }
}
