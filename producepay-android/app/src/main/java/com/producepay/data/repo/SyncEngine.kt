package com.producepay.data.repo
import com.producepay.data.local.OutboxDao
import com.producepay.data.local.OutboxEntity
import com.producepay.data.local.FarmerDao
import com.producepay.data.local.FarmerEntity
import com.producepay.data.models.CreateDeliveryRequest
import com.producepay.data.remote.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncEngine @Inject constructor(
    private val api: ApiService,
    private val outboxDao: OutboxDao
) {
    private val _isSyncing = MutableStateFlow(false)
    val isSyncing = _isSyncing.asStateFlow()

    suspend fun syncPendingDeliveries() {
        if (_isSyncing.value) return
        _isSyncing.value = true
        try {
            val pending = outboxDao.getPending()
            for (item in pending) {
                try {
                    outboxDao.updateStatus(item.clientRequestId, "syncing")
                    val request = CreateDeliveryRequest(item.farmerId, item.weightKg, item.collectedAt, item.notes, item.clientRequestId)
                    val response = api.createDelivery(request)
                    if (response.isSuccessful) {
                        outboxDao.delete(item.clientRequestId)
                    } else {
                        outboxDao.updateStatus(item.clientRequestId, "failed")
                    }
                } catch (e: Exception) {
                    outboxDao.updateStatus(item.clientRequestId, "failed")
                }
            }
        } finally {
            _isSyncing.value = false
        }
    }
}

@Singleton
class DeliveryRepository @Inject constructor(
    private val api: ApiService,
    private val outboxDao: OutboxDao,
    private val syncEngine: SyncEngine
) {
    suspend fun recordDelivery(farmerId: String, weightKg: Double, collectedAt: String, notes: String?) {
        val item = OutboxEntity(
            clientRequestId = UUID.randomUUID().toString(),
            farmerId = farmerId,
            weightKg = weightKg,
            collectedAt = collectedAt,
            notes = notes,
            status = "pending"
        )
        outboxDao.insert(item)
        syncEngine.syncPendingDeliveries()
    }
}
