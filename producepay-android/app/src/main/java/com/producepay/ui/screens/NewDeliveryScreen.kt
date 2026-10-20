package com.producepay.ui.screens
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.producepay.ui.components.*
import com.producepay.ui.viewmodels.DeliveriesViewModel

@Composable
fun NewDeliveryScreen(navController: NavController) {
    val viewModel: DeliveriesViewModel = hiltViewModel()
    var farmerId by remember { mutableStateOf("") }
    var weight by remember { mutableStateOf("") }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Record Delivery", fontSize = 24.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(16.dp))
        AppTextField(value = farmerId, onValueChange = { farmerId = it }, label = "Farmer ID")
        AppTextField(value = weight, onValueChange = { weight = it }, label = "Weight (kg)")
        Spacer(Modifier.height(24.dp))
        AppButton("Save Offline", onClick = {
            viewModel.saveDelivery(farmerId, weight.toDoubleOrNull() ?: 0.0, null)
            navController.popBackStack()
        })
    }
}
