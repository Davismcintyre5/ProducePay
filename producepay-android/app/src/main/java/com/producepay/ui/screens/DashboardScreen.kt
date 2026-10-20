package com.producepay.ui.screens
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.producepay.ui.components.AppCard
import com.producepay.ui.components.AppButton
import com.producepay.ui.theme.PrimaryGreen
import com.producepay.ui.viewmodels.DashboardViewModel

@Composable
fun DashboardScreen(navController: NavController) {
    val viewModel: DashboardViewModel = hiltViewModel()
    val stats by viewModel.stats.collectAsState()
    LaunchedEffect(Unit) { viewModel.loadStats() }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Dashboard", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        AppCard {
            Text("Total Deliveries", fontWeight = FontWeight.Bold)
            Text("${stats?.get^("totalDeliveries"^) ?: 0}", fontSize = 24.sp, color = PrimaryGreen)
        }
        Spacer(Modifier.height(16.dp))
        AppButton("Record Delivery", onClick = { navController.navigate("new_delivery") })
    }
}
