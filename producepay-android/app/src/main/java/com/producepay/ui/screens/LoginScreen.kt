package com.producepay.ui.screens
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.producepay.ui.components.*
import com.producepay.ui.theme.*
import com.producepay.ui.viewmodels.AuthViewModel

@Composable
fun LoginScreen(navController: NavController) {
    val viewModel: AuthViewModel = hiltViewModel()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(Modifier.fillMaxSize().background(BackgroundGray).padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text("ProducePay", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = PrimaryGreen)
        Text("MOIBEN Maize Management", color = TextMuted)
        Spacer(Modifier.height(32.dp))
        AppTextField(value = email, onValueChange = { email = it }, label = "Email")
        Spacer(Modifier.height(16.dp))
        AppTextField(value = password, onValueChange = { password = it }, label = "Password")
        if (error != null) { Text(error!!, color = Color.Red, modifier = Modifier.padding(top = 8.dp)) }
        Spacer(Modifier.height(24.dp))
        AppButton(text = "Sign In", isLoading = isLoading, onClick = { viewModel.login(email, password) { navController.navigate("dashboard") { popUpTo("login") { inclusive = true } } } })
    }
}
