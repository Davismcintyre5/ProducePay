package com.producepay.ui.screens
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.producepay.ui.components.AppCard
import com.producepay.ui.components.AppButton
import com.producepay.ui.viewmodels.DeliveriesViewModel

@Composable
fun DeliveriesScreen(navController: NavController) {
    val viewModel: DeliveriesViewModel = hiltViewModel()
    val outbox by viewModel.outbox.collectAsState()
    LaunchedEffect(Unit) { viewModel.loadDeliveries() }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        AppButton("New Delivery", onClick = { navController.navigate("new_delivery") })
        Spacer(Modifier.height(16.dp))
        if (outbox.isNotEmpty()) {
            Text("Pending Sync: ${outbox.size}", color = MaterialTheme.colorScheme.error)
        }
        LazyColumn() {
            items(outbox) { item ->
                AppCard(Modifier.padding(vertical = 4.dp)) {
                    Text("Farmer ID: ${item.farmerId}")
                    Text("Weight: ${item.weightKg} kg")
                }
            }
        }
    }
}
