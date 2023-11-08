import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import API_BASE_URL from "../apiConfig"; // Importar a URL base da API
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        username: username, // "vi"
        password: password, // "12345678"
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
      <Text style={styles.logoText2}> AVALIE </Text>
        <Text style={styles.logoText}> AVALIE </Text>

        <Text style={styles.loginTitle}>Acesso</Text>
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
        <Button title="Entrar" onPress={handleLogin} />
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
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
     textAlign: "left",
  },
  logoText: {
    color: '#7FABBF',
    fontWeight: "bold",
    fontSize: 65,
    marginBottom: 45,
  },
  logoText2: {
    color: '#EEE',
    fontWeight: "bold",
    fontSize: 92,
    textAlign: 'center', 
		position: 'absolute',
  	bottom: 500, 
  },
});

export default LoginScreen;
