package com.producepay.navigation
import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.producepay.ui.screens.*

@Composable
fun AppNavGraph() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = "login") {
        composable("login") { LoginScreen(navController) }
        composable("dashboard") { DashboardScreen(navController) }
        composable("deliveries") { DeliveriesScreen(navController) }
        composable("new_delivery") { NewDeliveryScreen(navController) }
        composable("payments") { PaymentsScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
        composable("settings") { SettingsScreen(navController) }
        composable("users") { UsersScreen(navController) }
    }
}
