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
import API_BASE_URL from "../../apiConfig";

import { Feather } from "@expo/vector-icons";
import DatePicker from "react-native-modern-datepicker";
import { getFormatedDate } from "react-native-modern-datepicker";
import { Picker } from "@react-native-picker/picker";

import { Container, Texto } from "../Home/styles";
import Header from "../../components/Header";

import AsyncStorage from '@react-native-async-storage/async-storage';

function Applies() {
  const [applies, setApplies] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]); // Lista de testes selecionados

  const [tests, setTests] = useState([]); // Lista de testes disponíveis
  const [isTestModalVisible, setIsTestModalVisible] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState([]);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedApply, setSelectedApply] = useState(null);
  const [newApply, setNewApply] = useState({
    start_date: "",
    finish_date: "",
    recruiter_id: "",
    candidate_id: "",
    comment: "",
  });

  const today = new Date();
  const startDate = getFormatedDate(
    today.setDate(today.getDate() + 1),
    "DD/MM/YYYY"
  );
  const [dateStart, setDateStart] = useState("01/08/2023");
  const [dateFinish, setDateFinish] = useState("01/08/2023");
  const [openS, setOpenS] = useState(false); // Abre e fecha o modal
  const [openF, setOpenF] = useState(false); // Abre e fecha o modal

  function handleDateChangeS(newDate) {
    setDateStart(newDate);
  }

  function handleDateChangeF(newDate) {
    setDateFinish(newDate);
  }

  function handleOnPressDateS() {
    setOpenS(!openS);
  }

  function handleOnPressDateF() {
    setOpenF(!openF);
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

  const fetchApplies = async () => {
    try {
      const token = await getAuthToken();
      
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/applies/?token=${token}`); 
        setApplies(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao buscar processos seletivos:", error);
    }
  };

  const fetchApplyTests = async (apply_id) => {
    try {
      const token = await getAuthToken();

      if (token) {
        // console.log(selectedApply);
        const response = await axios.get(`${API_BASE_URL}/applies/${apply_id}/tests/?token=${token}`);

        if (response.status === 200) {
          const fetchedTests = response.data;
          
          const savedTests = fetchedTests.filter((test) => test.status === 3); // Filtrar testes com status 3 (Saved)
          const availableTests = fetchedTests.filter((test) => test.status === 1); // Filtrar testes com status 1 (Available)
         
          setSelectedTests(savedTests); // Atualizar selectedTests com testes salvos (status 3)          
          setTests(availableTests); // Atualizar tests com testes disponíveis (status 1)
        } else {
          console.log("Erro ao buscar a lista de testes dessa aplicação");
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }        
    } catch (error) {
      console.error("Erro ao buscar testes dessa aplicação:", error);
    }
  };

  const fetchTests = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/tests/?token=${token}`);

        const availableTests = response.data.map((test) => ({
          ...test,
          status: 1, // STATUS: 1 - Available, 2 - Included, 3 - Saved, 4 - Removed
        }));

        setTests(availableTests);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }        
    } catch (error) {
      console.error("Erro ao buscar testes:", error);
    }
  };

  const fetchCandidate = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/candidates/?token=${token}`);
        setCandidates(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }  
    } catch (error) {
      console.error("Erro ao buscar candidatos:", error);
    }
  };

  const fetchRecruiter = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/recruiters/?token=${token}`);
        setRecruiters(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }  
    } catch (error) {
      console.error("Erro ao buscar recrutadores:", error);
    }
  };

  useEffect(() => {
    fetchApplies();
    fetchCandidate();
    fetchRecruiter();
    fetchTests();
  }, []);

  const toggleTestModal = () => {
    setIsTestModalVisible(!isTestModalVisible);
  };

  const handleSelectTest = (testId) => {
    const selectedTest = tests.find((test) => test.id === testId);

    if (selectedTest) {
      // Move o teste da lista de testes disponíveis para a lista de testes selecionados
      setTests(tests.filter((test) => test.id !== testId));
      console.log(selectedTest.status);
      selectedTest.status = selectedTest.status === 1 ? 2 : 3;  // Se estiver disponível muda para incluído, senão muda de removido para salvo
      setSelectedTests([...selectedTests, selectedTest]);
    }
  };

  const handleDeselectTest = (testId) => {
    const deselectedTest = selectedTests.find((test) => test.id === testId);

    if (deselectedTest) {
      // Move o teste da lista de testes selecionados para a lista de testes disponíveis
      setSelectedTests(selectedTests.filter((test) => test.id !== testId));
      console.log(deselectedTest.status);
      deselectedTest.status = deselectedTest.status === 2 ? 1 : 4; // Se estiver incluído muda para disponível, senão muda de salvo para removido
      setTests([...tests, deselectedTest]);
    }
  };

  const handleCreateApply = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        
        const requestData = { apply: {
          start_date: dateStart,
          finish_date: dateFinish,
          comment: newApply.comment,
          recruiter_id: selectedRecruiter,
          candidate_id: selectedCandidate,
          },
          tests: selectedTests, // Inclua os IDs dos testes recém-selecionados
        };

        const response = await axios.post(
          `${API_BASE_URL}/applies/?token=${token}`,
          requestData
        );

        if (response.status === 201) {
          setIsModalVisible(false);
          setNewApply({ start_date: "", finish_date: "", comment: "" });
          fetchApplies();
          setSelectedCandidate(null);
          setSelectedRecruiter(null);
          
          console.log(selectedTests);
          // Mover todos os questionários selecionados de volta para a lista de disponíveis
          selectedTests?.forEach((test) => {
            handleDeselectTest(test.id);
          });
        } else {
          console.log("Erro ao criar aplicação:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }  
    } catch (error) {
      fetchApplies();
      setSelectedCandidate(null);
      setSelectedRecruiter(null);
      // setSelectedTests(null);
      console.error("Erro ao criar aplicação:", error.message);
    }
  };

  const handleEditModalVisible = (isVisible, apply) => {
    setEditModalVisible(isVisible);
    setSelectedApply(apply);
    fetchApplyTests(apply.id);
    setSelectedCandidate(apply.candidate_id);
    setSelectedRecruiter(apply.recruiter_id);
  };

  const handleEditApply = async () => {
    try {
      const token = await getAuthToken();

      if (token) {

        const requestData = { apply: {
          start_date: selectedApply.start_date,
          finish_date: selectedApply.finish_date,
          comment: selectedApply.comment,
          recruiter_id: selectedRecruiter,
          candidate_id: selectedCandidate,
          },
          tests: selectedTests, // Inclua os IDs dos testes recém-selecionados
        };

        await axios.put(`${API_BASE_URL}/applies/${selectedApply.id}/?token=${token}`, requestData);
        setNewApply({ start_date: "", finish_date: "", comment: "" });
        setEditModalVisible(false);
        setSelectedApply(null);

        fetchApplies();
        setSelectedCandidate(null);
        setSelectedRecruiter(null);
        
        console.log(selectedTests);
        setSelectedTests(null);
        fetchTests();
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao atualizar aplicação:", error);
    }
  };

  const handleDeleteModalVisible = (isVisible, apply) => {
    setDeleteModalVisible(isVisible);
    setSelectedApply(apply);
  };

  const handleDeleteApply = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.delete(`${API_BASE_URL}/applies/${selectedApply.id}/?token=${token}`);

        if (response.status === 204) {
          fetchApplies(); // Atualiza a lista de usuários após a exclusão
          setDeleteModalVisible(false);
          setSelectedApply(null);
        } else {
          console.log("Erro ao remover aplicação:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao remover aplicação:", error);
    }
  };

  return (
    <Container>
      <Header title="Aplicações" />
      <Texto>Lista de aplicações cadastradas</Texto>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.modalButtonText}>NOVA APLICAÇÃO</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <FlatList
          data={applies}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.applyItem}>
              <View style={styles.applyInfo}>
                <Text style={styles.primary}>
                  Candidato: {item.candidate.name}
                </Text>
                <Text style={styles.primary}>
                  Recrutador: {item.recruiter.name}
                </Text>
                <Text style={styles.secundary}>{item.comment}</Text>
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

      {/* Modal CREATE APPLY */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.scrollViewSpace}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Aplicação</Text>

              <Text style={styles.labelName}>Recrutador</Text>
              <Picker
                selectedValue={selectedRecruiter}
                onValueChange={(itemValue) => setSelectedRecruiter(itemValue)}
              >
                <Picker.Item label="Selecione o recrutador" value={null} />
                {recruiters.map((recruiter) => (
                  <Picker.Item
                    key={recruiter.id}
                    label={recruiter.name}
                    value={recruiter.id}
                  />
                ))}
              </Picker>

              <Text style={styles.labelName}>Candidato</Text>
              <Picker
                selectedValue={selectedCandidate}
                onValueChange={(itemValue) => setSelectedCandidate(itemValue)}
              >
                <Picker.Item label="Selecione o candidato" value={null} />
                {candidates.map((candidate) => (
                  <Picker.Item
                    key={candidate.id}
                    label={candidate.name}
                    value={candidate.id}
                  />
                ))}
              </Picker>

              <Text style={styles.labelName}>Observações</Text>
              <TextInput
                multiline // Permite várias linhas de texto
                numberOfLines={4} // Número inicial de linhas visíveis
                placeholder="Informações sobre a aplicação ..."
                value={newApply.comment}
                onChangeText={(text) =>
                  setNewApply({ ...newApply, comment: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />

              <Text style={styles.labelName}>Data Início</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDateS}
              >
                <Text>{formatDate(dateStart)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={openS}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate}
                      selected={new Date(dateStart)}
                      onDateChange={handleDateChangeS}
                    />

                    <TouchableOpacity onPress={handleOnPressDateS}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.labelName}>Prazo Final</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDateF}
              >
                <Text>{formatDate(dateFinish)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={openF}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate}
                      selected={new Date(dateFinish)}
                      onDateChange={handleDateChangeF}
                    />

                    <TouchableOpacity onPress={handleOnPressDateF}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* ======================================================================================= */}
              <View style={styles.spacing} />
              <Text style={styles.modalTitle}>Questionários</Text>

              <View>
                {/* Lista de testes selecionados */}
                {selectedTests.map((test, index) => (
                  <View key={index} style={styles.applyItem}>
                    <Text style={test.status===2 ? styles.newTest : styles.commonTest}>{test.title}</Text>
                    <TouchableOpacity onPress={() => handleDeselectTest(test.id)}>
                      <Feather
                        style={styles.actionButtonText}
                        name="delete"
                        size={24}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Botão para adicionar novo teste */}
                <TouchableOpacity
                  style={styles.modalMiniButtonArea}
                  onPress={toggleTestModal}
                >
                  <Feather
                    style={styles.actionButtonText}
                    name="plus-circle"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>

                {/* Modal de seleção de testes */}
                <Modal visible={isTestModalVisible} animationType="fade" transparent>
                  <View style={styles.modalOverlay}>
                    <ScrollView style={styles.scrollViewSpace}>
                      <View style={styles.modalContent}>
                        <Text style={styles.labelName}>Selecionar Questionários:</Text>
                        <View style={styles.spacing} />
                          {tests.map((test) => (
                            <TouchableOpacity key={test.id} onPress={() => handleSelectTest(test.id)}>
                              <Text style={test.status===4 ? styles.removedTest : styles.commonTest}>{test.title}</Text>
                            </TouchableOpacity>
                          ))}
                        <TouchableOpacity onPress={toggleTestModal}>
                          <Text style={styles.buttonCloseModal}>Voltar</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </Modal>
              </View>
              <View style={styles.spacing} />
              {/* ======================================================================================= */}

              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleCreateApply}
                  color="#007AFF"
                />
                <Button
                  title="Cancelar"
                  onPress={() => setIsModalVisible(false)}
                  color="#A0ABDF" /* A0ABDF FF3B30 */
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Modal UPDATE APPLY */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.scrollViewSpace}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Aplicação</Text>

              <Text style={styles.labelName}>Recrutador</Text>
              <Picker
                selectedValue={selectedRecruiter}
                onValueChange={(itemValue) => setSelectedRecruiter(itemValue)}
              >
                <Picker.Item label="Selecione o recrutador" value={null} />
                {recruiters.map((recruiter) => (
                  <Picker.Item
                    key={recruiter.id}
                    label={recruiter.name}
                    value={recruiter.id}
                  />
                ))}
              </Picker>

              <Text style={styles.labelName}>Candidato</Text>
              <Picker
                selectedValue={selectedCandidate}
                onValueChange={(itemValue) => setSelectedCandidate(itemValue)}
              >
                <Picker.Item label="Selecione o candidato" value={null} />
                {candidates.map((candidate) => (
                  <Picker.Item
                    key={candidate.id}
                    label={candidate.name}
                    value={candidate.id}
                  />
                ))}
              </Picker>

              <Text style={styles.labelName}>Observações</Text>
              <TextInput
                multiline // Permite várias linhas de texto
                numberOfLines={4} // Número inicial de linhas visíveis
                placeholder="Informações sobre a aplicação ..."
                value={selectedApply ? selectedApply.comment : ""}
                onChangeText={(text) =>
                  setSelectedApply({ ...selectedApply, comment: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />

              <Text style={styles.labelName}>Data Início</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDateS}
              >
                <Text>{formatDate(dateStart)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={openS}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate}
                      selected={new Date(dateStart)}
                      onDateChange={handleDateChangeS}
                    />

                    <TouchableOpacity onPress={handleOnPressDateS}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              <Text style={styles.labelName}>Prazo Final</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={handleOnPressDateF}
              >
                <Text>{formatDate(dateFinish)}</Text>
              </TouchableOpacity>
              <Modal animationType="fade" transparent={true} visible={openF}>
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <DatePicker
                      mode="calendar"
                      minimumDate={startDate}
                      selected={new Date(dateFinish)}
                      onDateChange={handleDateChangeF}
                    />

                    <TouchableOpacity onPress={handleOnPressDateF}>
                      <Text>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>

              {/* ======================================================================================= */}
              <View style={styles.spacing} />
              <Text style={styles.modalTitle}>Questionários</Text>

              <View>
                {/* Lista de testes selecionados */}
                {selectedTests.map((test, index) => (
                  <View key={index} style={styles.applyItem}>
                    <Text style={test.status===2 ? styles.newTest : styles.commonTest}>{test.title}</Text>
                    <TouchableOpacity onPress={() => handleDeselectTest(test.id)}>
                      <Feather
                        style={styles.actionButtonText}
                        name="delete"
                        size={24}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Botão para adicionar novo teste */}
                <TouchableOpacity
                  style={styles.modalMiniButtonArea}
                  onPress={toggleTestModal}
                >
                  <Feather
                    style={styles.actionButtonText}
                    name="plus-circle"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>

                {/* Modal de seleção de testes */}
                <Modal visible={isTestModalVisible} animationType="fade" transparent>
                  <View style={styles.modalOverlay}>
                    <ScrollView style={styles.scrollViewSpace}>
                      <View style={styles.modalContent}>
                        <Text style={styles.labelName}>Selecionar Questionários:</Text>
                        <View style={styles.spacing} />
                          {tests.map((test) => (
                            <TouchableOpacity key={test.id} onPress={() => handleSelectTest(test.id)}>
                              <Text style={test.status===4 ? styles.removedTest : styles.commonTest}>{test.title}</Text>
                            </TouchableOpacity>
                          ))}
                        <TouchableOpacity onPress={toggleTestModal}>
                          <Text style={styles.buttonCloseModal}>Voltar</Text>
                        </TouchableOpacity>
                      </View>
                    </ScrollView>
                  </View>
                </Modal>
              </View>
              <View style={styles.spacing} />
              {/* ======================================================================================= */}

              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleEditApply}
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

      {/* Modal DELETE USER */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDelete}>
            <Text style={styles.modalText}>
              Deseja mesmo remover a aplicação?
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                onPress={handleDeleteApply}
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
  peopleActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  applyItem: {
    flexDirection: "row", // Alinha os elementos em uma linha
    justifyContent: "space-between", // Espaço entre os elementos
    alignItems: "center", // Alinha os elementos verticalmente
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#8FBBCF",
    paddingBottom: 8,
  },
  applyInfo: {
    flex: 1, // Ocupa o máximo de espaço possível na coluna à esquerda
  },
  userActions: {
    flexDirection: "row", // Alinha os elementos em uma linha
    alignItems: "center", // Alinha os elementos verticalmente
  },
  primary: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  secundary: {
    fontSize: 14,
    color: "#666",
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
  deleteButton: {
    color: "#FF3B30",
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
    width: "100%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 8,
  },
  modalMiniButtonArea: {
    textAlign: "right",
    paddingLeft: "89%",
  },
  scrollViewSpace: {
    width: "100%",
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
    borderColor: "#8FBBCF",
    marginBottom: 16,
    borderRadius: 4,
  },
  memoInput: {
    width: "100%",
    padding: 8,
    borderWidth: 1,
    borderColor: "#CCC",
    marginBottom: 16,
    borderRadius: 4,
    textAlign: "left",
    textAlignVertical: "top",
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
  buttonCloseModal: {
    paddingVertical: 20,
    marginHorizontal: 8,
    borderRadius: 4,
    marginTop: 16,
    fontWeight: "bold",
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
  newTest: {
    fontWeight: "bold",
    color: 'green',
  },
  removedTest: {
    fontWeight: "bold",
    color: "#8B0000",   
  },
  commonTest: {
    fontWeight: "bold",
  },
  spacing: {
    marginBottom: 35,
  },
});

export default Applies;
