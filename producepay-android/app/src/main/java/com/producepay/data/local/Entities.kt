package com.producepay.data.local
import androidx.room.*

@Entity(tableName = "outbox")
data class OutboxEntity(
    @PrimaryKey val clientRequestId: String,
    val farmerId: String,
    val weightKg: Double,
    val collectedAt: String,
    val notes: String?,
    val status: String, // "pending", "syncing", "failed"
    val createdAt: Long = System.currentTimeMillis()
)

@Dao
interface OutboxDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: OutboxEntity)
    @Query("SELECT * FROM outbox WHERE status IN ^('pending', 'failed'^) ORDER BY createdAt ASC")
    suspend fun getPending(): List<OutboxEntity>
    @Query("SELECT * FROM outbox ORDER BY createdAt DESC")
    suspend fun getAll(): List<OutboxEntity>
    @Query("UPDATE outbox SET status = :status WHERE clientRequestId = :id")
    suspend fun updateStatus(id: String, status: String)
    @Query("DELETE FROM outbox WHERE clientRequestId = :id")
    suspend fun delete(id: String)
    @Query("SELECT COUNT^(*^) FROM outbox WHERE status IN ^('pending', 'failed'^)")
    suspend fun countPending(): Int
}

@Entity(tableName = "farmers")
data class FarmerEntity(
    @PrimaryKey val id: String,
    val code: String,
    val name: String,
    val phone: String,
    val location: String?,
    val syncedAt: Long = System.currentTimeMillis()
)

@Dao
interface FarmerDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(farmers: List<FarmerEntity>)
    @Query("DELETE FROM farmers")
    suspend fun clear()
    @Query("SELECT * FROM farmers WHERE name LIKE 'query ^|^| '' ^|^| :query ^|^| ''")
    suspend fun search(query: String): List<FarmerEntity>
}
