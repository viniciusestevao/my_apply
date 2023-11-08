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
  ScrollView,
} from "react-native";
import axios from "axios";
import API_BASE_URL from "../../apiConfig"; // Importar a URL base da API
import { Feather } from "@expo/vector-icons";
import DatePicker from "react-native-modern-datepicker";
import { getFormatedDate } from "react-native-modern-datepicker";
import { Picker } from "@react-native-picker/picker";

import { Container, Texto } from "../Home/styles";
import Header from "../../components/Header";
import AsyncStorage from '@react-native-async-storage/async-storage';


function Candidate() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [people, setPeople] = useState([]);
  const [deleteModalCandidateVisible, setDeleteModalCandidateVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [newPeople, setNewPeople] = useState({
    name: "",
    doc_rg: "",
    doc_cpf: "",
    birth_date: "",
    phone_1: "",
    phone_2: "",
    email: "",
    address_description: "",
    address_number: "",
    neighborhood: "",
    city: "",
    state: "",
    CEP: "",
    user_id: "",
    is_candidate: "",
  });

  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate() + 1),
    "DD/MM/YYYY"
  );
  const [date, setDate] = useState("01/08/2023");
  const [open, setOpen] = useState(false); // Abre e fecha o modal

  function handleDateChange(newDate) {
    setDate(newDate);
  }

  function handleOnPressDate() {
    setOpen(!open);
  }

  function formatDate(dateString) {
    const parts = dateString.split("/");
    if (parts.length !== 3) {
      return "";
    }

    const day = parts[2].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[0];

    return `${day}/${month}/${year}`;
  }

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Erro ao recuperar o token de autenticação:', error);
      return null;
    }
  };

  const fetchPeople = async () => {
    try {
      const token = await getAuthToken();
      
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/candidates/?token=${token}`); // Rota para obter todos os candidatos
        setPeople(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao buscar candidatos:", error);
    }
  };

  useEffect(() => {
    fetchPeople();
    fetchUsers();
  }, []);

  const handleCreatePeople = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.post(`${API_BASE_URL}/candidates/?token=${token}`, {
          name: newPeople.name,
          doc_rg: newPeople.doc_rg,
          doc_cpf: newPeople.doc_cpf,
          birth_date: newPeople.birth_date,
          phone_1: newPeople.phone_1,
          phone_2: newPeople.phone_2,
          email: newPeople.email,
          address_description: newPeople.address_description,
          address_number: newPeople.address_number,
          neighborhood: newPeople.neighborhood,
          city: newPeople.city,
          state: newPeople.state,
          CEP: newPeople.CEP,
          user_id: selectedUser,
          is_candidate: 1,
        });
        if (response.status === 201) {
          setIsModalVisible(false); // Fechar o modal após criar o candidato
          setNewPeople({ id: "", user_id: "", name: "", doc_rg: "", doc_cpf: "", birth_date: "", phone_1: "", phone_2: "", address_description: "", address_number: "", neighborhood: "", city: "", state: "", CEP: "", is_candidate: "" }); // Limpar os campos do formulário
          fetchPeople();  // Atualizar a lista de candidatos
          setSelectedUser(null);
        } else {
          console.log("Erro ao criar candidato:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao criar candidato:", error.message);
    }
  };

  const handleEditModalVisible = (isVisible, people) => {
    setEditModalVisible(isVisible);
    setSelectedPerson(people);
    setSelectedUser(people.user_id);
  };

  const handleEditPeople = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        //console.log(selectedUser);
        await axios.put(
          `${API_BASE_URL}/candidates/${selectedPerson.id}/?token=${token}`, {
            name: selectedPerson.name,
            doc_rg: selectedPerson.doc_rg,
            doc_cpf: selectedPerson.doc_cpf,
            birth_date: selectedPerson.birth_date,
            phone_1: selectedPerson.phone_1,
            phone_2: selectedPerson.phone_2,
            email: selectedPerson.email,
            address_description: selectedPerson.address_description,
            address_number: selectedPerson.address_number,
            neighborhood: selectedPerson.neighborhood,
            city: selectedPerson.city,
            state: selectedPerson.state,
            CEP: selectedPerson.CEP,
            user_id: selectedUser,
            is_candidate: 1,
          });
        setNewPeople({ id: "", name: "", doc_rg: "", doc_cpf: "", birth_date: "", phone_1: "", phone_2: "", address_description: "", address_number: "", neighborhood: "", city: "", state: "", CEP: "", is_candidate: "" }); // Limpar os campos do formulário

        fetchPeople();
        setEditModalVisible(false);
        setSelectedPerson(null);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao atualizar candidato:", error);
    }
  };

  const handleDeleteModalCandidateVisible = (isVisible, people) => {
    setDeleteModalCandidateVisible(isVisible);
    setSelectedPerson(people);
  };

  const handleDeletePeople = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        //console.log(selectedPerson.id);
        const response = await axios.delete(`${API_BASE_URL}/candidates/${selectedPerson.id}/?token=${token}`);

        if (response.status === 204) {
          fetchPeople(); // Atualiza a lista de candidatos após a exclusão
          setDeleteModalCandidateVisible(false);
          setSelectedPerson(null);
        } else {
          fetchPeople();
          console.log("Erro ao remover candidato:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      fetchPeople();
      console.error("Erro ao remover candidato:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/users/?token=${token}`);
        setUsers(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  return (
    <Container>
      <Header title="Candidatos" />
      <Texto>Lista de candidatos cadastrados</Texto>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.modalButtonText}>NOVO CANDIDATO</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <FlatList
          data={people}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.peopleItem}>
              <View style={styles.peopleInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>
                  {item.city} - {item.state}
                </Text>
              </View>
              <View style={styles.peopleActions}>
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
                  onPress={() => handleDeleteModalCandidateVisible(true, item)}
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

      {/* Modal CREATE CANDIDATE */}

      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Novo Candidato</Text>

              <Text style={styles.labelName}>Nome</Text>
              <TextInput
                placeholder="Nome"
                value={newPeople.name}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, name: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>RG</Text>
              <TextInput
                placeholder="RG"
                value={newPeople.doc_rg}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, doc_rg: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CPF</Text>
              <TextInput
                placeholder="CPF"
                value={newPeople.doc_cpf}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, doc_cpf: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Data Nascimento</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDate}
              >
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={open}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate} // Usar a variável startDate ao invés de "startDate"
                      selected={date} // Converter a string 'date' para um objeto Date
                      onDateChange={handleDateChange} // Usar a função handleDateChange
                      minDate={new Date("02-01-1950")}
                    />

                    <TouchableOpacity onPress={handleOnPressDate}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.labelName}>Telefone</Text>
              <TextInput
                placeholder="Telefone"
                value={newPeople.phone_1}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, phone_1: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Celular</Text>
              <TextInput
                placeholder="Celular"
                value={newPeople.phone_2}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, phone_2: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Endereço</Text>
              <TextInput
                placeholder="Endereço"
                value={newPeople.address_description}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, address_description: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Número</Text>
              <TextInput
                placeholder="Número"
                value={newPeople.address_number}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, address_number: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Bairro</Text>
              <TextInput
                placeholder="Bairro"
                value={newPeople.neighborhood}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, neighborhood: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Cidade</Text>
              <TextInput
                placeholder="Cidade"
                value={newPeople.city}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, city: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Estado</Text>
              <TextInput
                placeholder="Estado"
                value={newPeople.state}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, state: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CEP</Text>
              <TextInput
                placeholder="CEP"
                value={newPeople.CEP}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, CEP: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Usuário</Text>
              <Picker
                selectedValue={selectedUser}
                onValueChange={(itemValue) => setSelectedUser(itemValue)}
              >
                <Picker.Item label="Selecione um usuário" value={null} />
                {users.map((user) => (
                  <Picker.Item
                    key={user.id}
                    label={user.username + " - " + user.email}
                    value={user.id}
                  />
                ))}
              </Picker>

              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleCreatePeople}
                  color="#007AFF"
                />
                <Button
                  title="Cancelar"
                  onPress={() => setIsModalVisible(false)}
                  color="#A0ABDF"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal UPDATE CANDIDATE */}
      <Modal style={styles.modalOverlay} visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Candidato</Text>

              <Text style={styles.labelName}>Nome</Text>
              <TextInput
                placeholder="Nome"
                value={selectedPerson ? selectedPerson.name : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, name: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>RG</Text>
              <TextInput
                placeholder="RG"
                value={selectedPerson ? selectedPerson.doc_rg : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, doc_rg: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CPF</Text>
              <TextInput
                placeholder="CPF"
                value={selectedPerson ? selectedPerson.doc_cpf : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, doc_cpf: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Data Nascimento</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDate}
              >
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={open}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate} // Usar a variável startDate ao invés de "startDate"
                      selected={date} // Converter a string 'date' para um objeto Date
                      onDateChange={handleDateChange} // Usar a função handleDateChange
                      minDate={new Date("02-01-1950")}
                    />

                    <TouchableOpacity onPress={handleOnPressDate}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.labelName}>Telefone</Text>
              <TextInput
                placeholder="Telefone"
                value={selectedPerson ? selectedPerson.phone_1 : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, phone_1: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Celular</Text>
              <TextInput
                placeholder="Celular"
                value={selectedPerson ? selectedPerson.phone_2 : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, phone_2: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Endereço</Text>
              <TextInput
                placeholder="Endereço"
                value={selectedPerson ? selectedPerson.address_description : ''}
                onChangeText={(text) =>
                  setSelectedPerson({
                    ...selectedPerson,
                    address_description: text,
                  })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Número</Text>
              <TextInput
                placeholder="Número"
                value={selectedPerson ? selectedPerson.address_number : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, address_number: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Bairro</Text>
              <TextInput
                placeholder="Bairro"
                value={selectedPerson ? selectedPerson.neighborhood : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, neighborhood: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Cidade</Text>
              <TextInput
                placeholder="Cidade"
                value={selectedPerson ? selectedPerson.city : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, city: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Estado</Text>
              <TextInput
                placeholder="Estado"
                value={selectedPerson ? selectedPerson.state : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, state: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CEP</Text>
              <TextInput
                placeholder="CEP"
                value={selectedPerson ? selectedPerson.CEP : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, CEP: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Usuário</Text>
              <Picker
                selectedValue={selectedUser}
                onValueChange={(itemValue) => setSelectedUser(itemValue)}
              >
                <Picker.Item label="Selecione um usuário" value={null} />
                {users.map((user) => (
                  <Picker.Item
                    key={user.id}
                    label={user.username + " - " + user.email}
                    value={user.id}
                  />
                ))}
              </Picker>

              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleEditPeople}
                  color="#007AFF"
                />
                <Button
                  title="Cancelar"
                  onPress={() => setEditModalVisible(false)}
                  color="#A0ABDF"
                />
              </View>
            </View>
          </ScrollView>
        </View> 
      </Modal>

      {/* Modal DELETE CANDIDATE */}
      <Modal
        visible={deleteModalCandidateVisible}
        animationType="fade"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDelete}>
            <Text style={styles.modalText}>
              Deseja mesmo remover o candidato?
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                onPress={handleDeletePeople}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeleteModalCandidateVisible(false)}
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










function Recruiter({ personType }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [people, setPeople] = useState([]);
  const [deleteModalCandidateVisible, setDeleteModalCandidateVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [newPeople, setNewPeople] = useState({
    name: "",
    doc_rg: "",
    doc_cpf: "",
    birth_date: "",
    phone_1: "",
    phone_2: "",
    email: "",
    address_description: "",
    address_number: "",
    neighborhood: "",
    city: "",
    state: "",
    CEP: "",
    id: "",
    is_candidate: "",
  });

  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate() + 1),
    "DD/MM/YYYY"
  );
  const [date, setDate] = useState("01/08/2023");
  const [open, setOpen] = useState(false); // Abre e fecha o modal

  function handleDateChange(newDate) {
    setDate(newDate);
  }

  function handleOnPressDate() {
    setOpen(!open);
  }

  function formatDate(dateString) {
    const parts = dateString.split("/");
    if (parts.length !== 3) {
      return "";
    }

    const day = parts[2].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[0];

    return `${day}/${month}/${year}`;
  }

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Erro ao recuperar o token de autenticação:', error);
      return null;
    }
  };

  const fetchPeople = async () => {
    try {
      const token = await getAuthToken();
      console.log(token);
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/recruiters/?token=${token}`); // Rota para obter todos os recrutadores
        setPeople(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao buscar recrutadores:", error);
    }
  };

  useEffect(() => {
    fetchPeople();
    fetchUsers();
  }, []);

  const handleCreatePeople = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.post(`${API_BASE_URL}/recruiters/?token=${token}`, {
          name: newPeople.name,
          doc_rg: newPeople.doc_rg,
          doc_cpf: newPeople.doc_cpf,
          birth_date: newPeople.birth_date,
          phone_1: newPeople.phone_1,
          phone_2: newPeople.phone_2,
          email: newPeople.email,
          address_description: newPeople.address_description,
          address_number: newPeople.address_number,
          neighborhood: newPeople.neighborhood,
          city: newPeople.city,
          state: newPeople.state,
          CEP: newPeople.CEP,
          user_id: selectedUser,
          is_candidate: 0,
        });
        if (response.status === 201) {
          setIsModalVisible(false); // Fechar o modal após criar o recrutador
          setNewPeople({ id: "", user_id: "", name: "", doc_rg: "", doc_cpf: "", birth_date: "", phone_1: "", phone_2: "", address_description: "", address_number: "", neighborhood: "", city: "", state: "", CEP: "", is_candidate: "" }); // Limpar os campos do formulário
          fetchPeople();  // Atualizar a lista de recrutadores
          setSelectedUser(null);
        } else {
          console.log("Erro ao criar recrutador:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao criar recrutador:", error.message);
    }
  };

  const handleEditModalVisible = (isVisible, people) => {
    setEditModalVisible(isVisible);
    setSelectedPerson(people);
    setSelectedUser(people.user_id);
  };

  const handleEditPeople = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        //console.log(selectedUser);
        await axios.put(
          `${API_BASE_URL}/recruiters/${selectedPerson.id}/?token=${token}`, {
            name: selectedPerson.name,
            doc_rg: selectedPerson.doc_rg,
            doc_cpf: selectedPerson.doc_cpf,
            birth_date: selectedPerson.birth_date,
            phone_1: selectedPerson.phone_1,
            phone_2: selectedPerson.phone_2,
            email: selectedPerson.email,
            address_description: selectedPerson.address_description,
            address_number: selectedPerson.address_number,
            neighborhood: selectedPerson.neighborhood,
            city: selectedPerson.city,
            state: selectedPerson.state,
            CEP: selectedPerson.CEP,
            user_id: selectedUser,
            is_candidate: 0,
          });
        setNewPeople({ id: "", name: "", doc_rg: "", doc_cpf: "", birth_date: "", phone_1: "", phone_2: "", address_description: "", address_number: "", neighborhood: "", city: "", state: "", CEP: "", is_candidate: "" }); // Limpar os campos do formulário

        fetchPeople();
        setEditModalVisible(false);
        setSelectedPerson(null);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao atualizar recrutador:", error);
    }
  };

  const handleDeleteModalCandidateVisible = (isVisible, people) => {
    setDeleteModalCandidateVisible(isVisible);
    setSelectedPerson(people);
  };

  const handleDeletePeople = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        //console.log(selectedPerson.id);
        const response = await axios.delete(`${API_BASE_URL}/recruiters/${selectedPerson.id}/?token=${token}`);

        if (response.status === 204) {
          fetchPeople(); // Atualiza a lista de recrutadores após a exclusão
          setDeleteModalCandidateVisible(false);
          setSelectedPerson(null);
        } else {
          fetchPeople();
          console.log("Erro ao remover recrutador:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      fetchPeople();
      console.error("Erro ao atualizar recrutador:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/users/?token=${token}`);
        setUsers(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  return (
    <Container>
      <Header title="Recrutador" />
      <Texto>Lista de recrutadores cadastrados</Texto>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.modalButtonText}>NOVO RECRUTADOR</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <FlatList
          data={people}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.peopleItem}>
              <View style={styles.peopleInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>
                  {item.city} - {item.state}
                </Text>
              </View>
              <View style={styles.peopleActions}>
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
                  onPress={() => handleDeleteModalCandidateVisible(true, item)}
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

      {/* Modal CREATE CANDIDATE */}

      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Novo Recrutador</Text>

              <Text style={styles.labelName}>Nome</Text>
              <TextInput
                placeholder="Nome"
                value={newPeople.name}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, name: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>RG</Text>
              <TextInput
                placeholder="RG"
                value={newPeople.doc_rg}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, doc_rg: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CPF</Text>
              <TextInput
                placeholder="CPF"
                value={newPeople.doc_cpf}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, doc_cpf: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Data Nascimento</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDate}
              >
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={open}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate} // Usar a variável startDate ao invés de "startDate"
                      selected={new Date(date)} // Converter a string 'date' para um objeto Date
                      onDateChange={handleDateChange} // Usar a função handleDateChange
                      minDate={new Date("02-01-1950")}
                    />

                    <TouchableOpacity onPress={handleOnPressDate}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.labelName}>Telefone</Text>
              <TextInput
                placeholder="Telefone"
                value={newPeople.phone_1}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, phone_1: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Celular</Text>
              <TextInput
                placeholder="Celular"
                value={newPeople.phone_2}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, phone_2: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Endereço</Text>
              <TextInput
                placeholder="Endereço"
                value={newPeople.address_description}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, address_description: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Número</Text>
              <TextInput
                placeholder="Número"
                value={newPeople.address_number}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, address_number: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Bairro</Text>
              <TextInput
                placeholder="Bairro"
                value={newPeople.neighborhood}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, neighborhood: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Cidade</Text>
              <TextInput
                placeholder="Cidade"
                value={newPeople.city}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, city: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Estado</Text>
              <TextInput
                placeholder="Estado"
                value={newPeople.state}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, state: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CEP</Text>
              <TextInput
                placeholder="CEP"
                value={newPeople.CEP}
                onChangeText={(text) =>
                  setNewPeople({ ...newPeople, CEP: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Usuário</Text>
              <Picker
                selectedValue={selectedUser}
                onValueChange={(itemValue) => setSelectedUser(itemValue)}
              >
                <Picker.Item label="Selecione um usuário" value={null} />
                {users.map((user) => (
                  <Picker.Item
                    key={user.id}
                    label={user.username + " - " + user.email}
                    value={user.id}
                  />
                ))}
              </Picker>

              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleCreatePeople}
                  color="#007AFF"
                />
                <Button
                  title="Cancelar"
                  onPress={() => setIsModalVisible(false)}
                  color="#A0ABDF"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal UPDATE CANDIDATE */}
      <Modal style={styles.modalOverlay} visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Recrutador</Text>

              <Text style={styles.labelName}>Nome</Text>
              <TextInput
                placeholder="Nome"
                value={selectedPerson ? selectedPerson.name : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, name: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>RG</Text>
              <TextInput
                placeholder="RG"
                value={selectedPerson ? selectedPerson.doc_rg : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, doc_rg: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CPF</Text>
              <TextInput
                placeholder="CPF"
                value={selectedPerson ? selectedPerson.doc_cpf : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, doc_cpf: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Data Nascimento</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDate}
              >
                <Text>{formatDate(date)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={open}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate} // Usar a variável startDate ao invés de "startDate"
                      selected={new Date(date)} // Converter a string 'date' para um objeto Date
                      onDateChange={handleDateChange} // Usar a função handleDateChange
                      minDate={new Date("02-01-1950")}
                    />

                    <TouchableOpacity onPress={handleOnPressDate}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.labelName}>Telefone</Text>
              <TextInput
                placeholder="Telefone"
                value={selectedPerson ? selectedPerson.phone_1 : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, phone_1: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Celular</Text>
              <TextInput
                placeholder="Celular"
                value={selectedPerson ? selectedPerson.phone_2 : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, phone_2: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Endereço</Text>
              <TextInput
                placeholder="Endereço"
                value={selectedPerson ? selectedPerson.address_description : ''}
                onChangeText={(text) =>
                  setSelectedPerson({
                    ...selectedPerson,
                    address_description: text,
                  })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Número</Text>
              <TextInput
                placeholder="Número"
                value={selectedPerson ? selectedPerson.address_number : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, address_number: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Bairro</Text>
              <TextInput
                placeholder="Bairro"
                value={selectedPerson ? selectedPerson.neighborhood : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, neighborhood: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Cidade</Text>
              <TextInput
                placeholder="Cidade"
                value={selectedPerson ? selectedPerson.city : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, city: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Estado</Text>
              <TextInput
                placeholder="Estado"
                value={selectedPerson ? selectedPerson.state : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, state: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>CEP</Text>
              <TextInput
                placeholder="CEP"
                value={selectedPerson ? selectedPerson.CEP : ''}
                onChangeText={(text) =>
                  setSelectedPerson({ ...selectedPerson, CEP: text })
                }
                style={styles.modalInput}
              />

              <Text style={styles.labelName}>Usuário</Text>
              <Picker
                selectedValue={selectedUser}
                onValueChange={(itemValue) => setSelectedUser(itemValue)}
              >
                <Picker.Item label="Selecione um usuário" value={null} />
                {users.map((user) => (
                  <Picker.Item
                    key={user.id}
                    label={user.username + " - " + user.email}
                    value={user.id}
                  />
                ))}
              </Picker>

              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleEditPeople}
                  color="#007AFF"
                />
                <Button
                  title="Cancelar"
                  onPress={() => setEditModalVisible(false)}
                  color="#FF3B30"
                />
              </View>
            </View>
          </ScrollView>
        </View> 
      </Modal>

      {/* Modal DELETE CANDIDATE */}
      <Modal
        visible={deleteModalCandidateVisible}
        animationType="fade"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDelete}>
            <Text style={styles.modalText}>
              Deseja mesmo remover o candidato?
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                onPress={handleDeletePeople}
                style={styles.modalButton}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDeleteModalCandidateVisible(false)}
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
  peopleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#8FBBCF",
    paddingBottom: 8,
  },
  peopleInfo: {
    flex: 1,
    marginRight: 16,
  },
  peoplename: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  peopleActions: {
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
    width: 300,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
  },
  scrollViewContent: {
    width: "100%",
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
  datePickerButton: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginBottom: 16,
    textAlign: "left", // Alinha o texto à esquerda
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
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 35,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  labelName: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
});

const exportedFunctions = {
  Candidate,
  Recruiter,
};

export default exportedFunctions;
