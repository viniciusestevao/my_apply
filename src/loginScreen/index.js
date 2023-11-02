import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../apiConfig"; // Importar a URL base da API
import AsyncStorage from '@react-native-async-storage/async-storage';


const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: username,
        password: password,
      });

      if (response.status === 200) {
        // Autenticação bem-sucedida, redirecione para a próxima tela
        saveAuthToken(response.data.token.token);
        navigation.navigate("Home");
      } else {
        setErrorMessage("Credenciais inválidas. Por favor, tente novamente.");
      }
    } catch (error) {
      console.log(error);
      setErrorMessage(
        "Ocorreu um erro ao tentar efetuar login. Por favor, tente novamente mais tarde."
      );
    }
  };

  const saveAuthToken = async (token) => {
    try {
      await AsyncStorage.setItem('authToken', token);
    } catch (error) {
      console.error('Erro ao salvar o token de autenticação:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.loginTitle}>
        Acesse o <Text style={styles.blueText}>APPLY</Text>
      </Text>

      <Text style={styles.errorText}>{errorMessage}</Text>
      <TextInput
        placeholder="Nome de usuário"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  input: {
    width: "80%",
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  loginTitle: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  blueText: {
    color: "#007AFF",
    fontSize: 32,
  },
});

export default LoginScreen;
