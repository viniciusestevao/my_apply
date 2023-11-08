import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import API_BASE_URL from "../../apiConfig"; // Importar a URL base da API
//import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Feather } from '@expo/vector-icons';
//import Icon from 'react-native-vector-icons';

import { Container, Texto } from "../Home/styles";
import Header from "../../components/Header";
import AsyncStorage from '@react-native-async-storage/async-storage';

function Users() {
  const [users, setUsers] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
  });

  const getAuthToken = async () => {
    try {
      //console.log("Auth token");
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Erro ao recuperar o token de autenticação:', error);
      return null;
    }
  };
  
  
  const fetchUsers = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/users/?token=${token}`); // Rota para obter todos os usuários
        setUsers(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.post(`${API_BASE_URL}/users/?token=${token}`, newUser);

        if (response.status === 201) {
          setIsModalVisible(false); // Fechar o modal após criar o usuário
          setNewUser({ username: "", password: "", email: "" }); // Limpar os campos do formulário
          fetchUsers(); // Atualizar a lista de usuários
        } else {
          console.log("Erro ao criar usuário:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error.message);
    }
  };

  const handleEditModalVisible = (isVisible, user) => {
    setEditModalVisible(isVisible);
    setSelectedUser(user);
  };

  const handleEditUser = async () => {
    try {
      const token = await getAuthToken();

      if (token) {

        await axios.put(
          `${API_BASE_URL}/users/${selectedUser.id}/?token=${token}`,
          selectedUser
        );
        fetchUsers();
        setEditModalVisible(false);
        setSelectedUser(null);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleDeleteModalVisible = (isVisible, user) => {
    setDeleteModalVisible(isVisible);
    setSelectedUser(user);
    setErrorMessage(null);
  };

  const handleDeleteUser = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.delete(`${API_BASE_URL}/users/${selectedUser.id}/?token=${token}`);
        
        if (response.status === 204) {
          fetchUsers(); // Atualiza a lista de usuários após a exclusão
          setDeleteModalVisible(false);
          setSelectedUser(null);
        } else {
          console.log("Erro ao criar usuário:", response.data.message);
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Erro desconhecido ao excluir o usuário.");
      }
      //console.error("Erro ao atualizar usuário:", error);
    }
  };

  return (
    <Container>
      <Header title="Usuários" />
      <Texto>Lista de usuários cadastrados</Texto>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.modalButtonText}>NOVO USUÁRIO</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              <View style={styles.userActions}>
                <TouchableOpacity
                  onPress={() => handleEditModalVisible(true, item)}
                >
                  <Feather
                    style={styles.actionButtonText}
                    name="edit-3"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteModalVisible(true, item)}
                >
                  <Feather
                    style={styles.actionButtonText}
                    name="trash-2"
                    size={24}
                    color="#FF3B30"
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* Modal CREATE USER */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Novo Usuário</Text>

            <Text style={styles.labelName}>Nome de usuário</Text>
            <TextInput
              placeholder="Nome de usuário"
              value={newUser.username}
              onChangeText={(text) =>
                setNewUser({ ...newUser, username: text })
              }
              style={styles.modalInput}
            />

            <Text style={styles.labelName}>E-mail</Text>
            <TextInput
              placeholder="Email"
              value={newUser.email}
              onChangeText={(text) => setNewUser({ ...newUser, email: text })}
              style={styles.modalInput}
            />

            <Text style={styles.labelName}>Senha</Text>
            <TextInput
              placeholder="Senha"
              value={newUser.password}
              onChangeText={(text) =>
                setNewUser({ ...newUser, password: text })
              }
              style={styles.modalInput}
              secureTextEntry
            />

            <View style={styles.modalButtonGroup}>
              <Button
                title="Salvar"
                onPress={handleCreateUser}
                color="#007AFF"
              />
              <Button
                title="Cancelar"
                onPress={() => setIsModalVisible(false)}
                color="#A0ABDF"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal UPDATE USER */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Usuário</Text>

            <Text style={styles.labelName}>Nome de usuário</Text>
            <TextInput
              placeholder="Nome de usuário"
              value={selectedUser ? selectedUser.username : ""}
              onChangeText={(text) =>
                setSelectedUser({ ...selectedUser, username: text })
              }
              style={styles.modalInput}
            />

            <Text style={styles.labelName}>E-mail</Text>
            <TextInput
              placeholder="Email"
              value={selectedUser ? selectedUser.email : ""}
              onChangeText={(text) =>
                setSelectedUser({ ...selectedUser, email: text })
              }
              style={styles.modalInput}
            />

            <Text style={styles.labelName}>Senha</Text>
            <TextInput
              placeholder="Senha"
              value={selectedUser ? selectedUser.password : ""}
              onChangeText={(text) =>
                setSelectedUser({ ...selectedUser, password: text })
              }
              style={styles.modalInput}
              secureTextEntry
            />
            <View style={styles.modalButtonGroup}>
              <Button title="Salvar" onPress={handleEditUser} color="#007AFF" />
              <Button
                title="Cancelar"
                onPress={() => setEditModalVisible(false)}
                color="#A0ABDF"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal DELETE USER */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDelete}>
            <Text style={styles.modalText}>
              Deseja mesmo remover o usuário?
            </Text>
            {errorMessage && <Text style={{ color: 'red', marginBottom: 16 }}>{errorMessage}</Text>}

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                onPress={handleDeleteUser}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeleteModalVisible(false)}
                style={[styles.modalButton, styles.modalButtonCancel]}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainerDelete: {
    justifyContent: "center",
    alignItems: "center",
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#8FBBCF",
    paddingBottom: 8,
  },
  userInfo: {
    flex: 1,
    marginRight: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  actionButton: {
    width: "40%",
    backgroundColor: "#007AFF",
    borderRadius: 4,
    flexDirection: "row",
    marginVertical: 10,
    marginLeft: 220,
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonDelete: {
    backgroundColor: "#FF3B30",
    marginLeft: 8,
  },
  actionButtonText: {
    fontWeight: "bold",
    paddingRight: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center",
  },
  labelName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "left",
  },
  modalInput: {
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    marginBottom: 16,
    borderRadius: 4,
  },
  modalButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  modalButtonCancel: {
    backgroundColor: "#A0ABDF",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  modalContentDelete: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 16,
  },
});

export default Users;
