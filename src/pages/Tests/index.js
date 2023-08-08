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
import API_BASE_URL from "../../apiConfig"; 
import { Feather } from "@expo/vector-icons";
import DatePicker from "react-native-modern-datepicker";
import { getFormatedDate } from "react-native-modern-datepicker";
import { Picker } from "@react-native-picker/picker";

import { Container, Texto } from "../Home/styles";
import Header from "../../components/Header";

function Tests() {
  const [users, setUsers] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    email: "",
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`); // Rota para obter todos os usuários
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/createUser`, newUser);
      if (response.data.success) {
        setIsModalVisible(false); // Fechar o modal após criar o usuário
        setNewUser({ username: "", password: "", email: "" }); // Limpar os campos do formulário
        fetchUsers(); // Atualizar a lista de usuários
      } else {
        console.log("Erro ao criar usuário:", response.data.message);
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
      await axios.put(
        `${API_BASE_URL}/updateUser/${selectedUser.user_id}`,
        selectedUser
      );
      fetchUsers();
      setEditModalVisible(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleDeleteModalVisible = (isVisible, user) => {
    setDeleteModalVisible(isVisible);
    setSelectedUser(user);
  };

  const handleDeleteUser = async () => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/deleteUser/${selectedUser.user_id}`,
        selectedUser
      );
      if (response.data.success) {
        fetchUsers(); // Atualiza a lista de usuários após a exclusão
        setDeleteModalVisible(false);
        setSelectedUser(null);
      } else {
        console.log("Erro ao criar usuário:", response.data.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  return (
    <Container>
      <Header title="Usuários" />
      <Texto>Lista de usuários cadastrados</Texto>

    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  userItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 8,
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
    borderColor: "#ccc",
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

export default Tests;
