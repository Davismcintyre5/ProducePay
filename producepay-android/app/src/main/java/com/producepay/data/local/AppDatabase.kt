package com.producepay.data.local
import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [OutboxEntity::class, FarmerEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun outboxDao(): OutboxDao
    abstract fun farmerDao(): FarmerDao
}
