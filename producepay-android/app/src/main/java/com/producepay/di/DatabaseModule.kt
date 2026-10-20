package com.producepay.di
import android.content.Context
import androidx.room.Room
import com.producepay.data.local.AppDatabase
import com.producepay.data.local.OutboxDao
import com.producepay.data.local.FarmerDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(context, AppDatabase::class.java, "producepay.db").fallbackToDestructiveMigration().build()
    }
    @Provides fun provideOutboxDao(db: AppDatabase): OutboxDao = db.outboxDao()
    @Provides fun provideFarmerDao(db: AppDatabase): FarmerDao = db.farmerDao()
}
