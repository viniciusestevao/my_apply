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

function Tests() {
  const [tests, setTests] = useState([]); 
  const [selectedQuestions, setSelectedQuestions] = useState([]); 
  
  const [questions, setQuestions] = useState([]); // Lista de testes disponíveis
  const [isQuestionModalVisible, setIsQuestionModalVisible] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [newTest, setNewTest] = useState({
    title: "",
    description: "",
    instruction: "",
  });

  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Erro ao recuperar o token de autenticação:', error);
      return null;
    }
  };

  const fetchTests = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/tests/?token=${token}`);

        setTests(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }        
    } catch (error) {
      console.error("Erro ao buscar testes:", error);
    }
  };

  const fetchTestItems = async (test_id) => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/tests/${test_id}/questions/?token=${token}`);

        if (response.status === 200) {
          const fetchedQuestions = response.data;
          console.log(fetchedQuestions);
          const savedQuestions = fetchedQuestions.filter((question) => question.status === 3); // Filtrar questões com status 3 (Saved)
          const availableQuestions = fetchedQuestions.filter((question) => question.status === 1); // Filtrar questões com status 1 (Available)
         
          setSelectedQuestions(savedQuestions); // Atualizar selectedQuestions com questões salvos (status 3)
          setQuestions(availableQuestions); // Atualizar questions com questões disponíveis (status 1)
        } else {
          console.log("Erro ao buscar a lista de questões desse questionário");
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }        
    } catch (error) {
      console.error("Erro ao buscar questões desse questionário:", error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.get(`${API_BASE_URL}/questions/?token=${token}`);

        const availableQuestions = response.data.map((question) => ({
          ...question,
          status: 1, // STATUS: 1 - Available, 2 - Included, 3 - Saved, 4 - Removed
        }));

        setQuestions(availableQuestions);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }        
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchQuestions();
  }, []);

  const toggleQuestionModal = () => {
    setIsQuestionModalVisible(!isQuestionModalVisible);
  };

  const handleSelectQuestion = (questionId) => {
    const selectedQuestion = questions.find((question) => question.id === questionId);

    if (selectedQuestion) {
      // Move a questão da lista de questões disponíveis para a lista de questões selecionadas
      setQuestions(questions.filter((question) => question.id !== questionId));
      console.log(selectedQuestion.status);
      selectedQuestion.status = selectedQuestion.status === 1 ? 2 : 3;  // Se estiver disponível muda para incluído, senão muda de removido para salvo
      setSelectedQuestions([...selectedQuestions, selectedQuestion]);
    }
  };

  const handleDeselectQuestion = (questionId) => {
    const deselectedQuestion = selectedQuestions.find((question) => question.id === questionId);

    if (deselectedQuestion) {
      // Move a questão da lista de questões selecionados para a lista de questões disponíveis
      setSelectedQuestions(selectedQuestions.filter((question) => question.id !== questionId));
      console.log(deselectedQuestion.status);
      deselectedQuestion.status = deselectedQuestion.status === 2 ? 1 : 4; // Se estiver incluído muda para disponível, senão muda de salvo para removido
      setQuestions([...questions, deselectedQuestion]);
    }
  };

  const handleCreateTest = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const requestData = { test: {
          title: newTest.title,
          description: newTest.description,
          instruction: newTest.instruction,
          },
          questions: selectedQuestions, // Inclua os IDs das questões recém-selecionadas
        };

        console.log(requestData);

        const response = await axios.post(`${API_BASE_URL}/tests/?token=${token}`, requestData);

        if (response.status === 201) {
          setIsModalVisible(false);
          setNewTest({ title: "", description: "", instruction: "" });
          fetchTests();
                    
          // Mover todos os questionários selecionados de volta para a lista de disponíveis
          
        } else {
          console.log("Erro ao criar questionário:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }  
    } catch (error) {
      fetchTests();
      console.error("Erro ao criar questionário:", error.message);
    }
  };

  const handleEditModalVisible = (isVisible, test) => {
    setEditModalVisible(isVisible);
    setSelectedTest(test);
    fetchTestItems(test.id);
  };

  const handleEditTest = async () => {
    try {
      const token = await getAuthToken();

      if (token) {

        const requestData = { test: {
          title: selectedTest.title,
          description: selectedTest.description,
          instruction: selectedTest.instruction,
          },
          questions: selectedQuestions, // Inclua os IDs dos questiões recém-selecionados
        };

        await axios.put(`${API_BASE_URL}/tests/${selectedTest.id}/?token=${token}`, requestData);
        setNewTest({ title: "", description: "", instruction: "" });
        setEditModalVisible(false);
        setSelectedTest(null);
        fetchTests();
        
        console.log(selectedQuestions);
        setSelectedQuestions(null);
        fetchQuestions();
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      fetchTests();
      console.error("Erro ao atualizar aplicação:", error);
    }
  };

  const handleDeleteModalVisible = (isVisible, test) => {
    setDeleteModalVisible(isVisible);
    setSelectedTest(test);
  };

  const handleDeleteTest = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.delete(`${API_BASE_URL}/tests/${selectedTest.id}/?token=${token}`);
      
        if (response.status === 204) {
          fetchTests(); 
          setDeleteModalVisible(false);
          setSelectedTest(null);
        } else {
          console.log("Erro ao criar teste:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao atualizar teste:", error);
    }
  };

  return (
    <Container>
      <Header title="Questionários" />
      <Texto>Lista de questionários cadastrados</Texto>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.modalButtonText}>NOVO QUESTIONÁRIO</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <FlatList
          data={tests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.primary}>{item.title}</Text>
                <Text style={styles.secundary}>{item.description}</Text>
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

      {/* Modal CREATE TEST */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.scrollViewSpace}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Questionário</Text>

              <Text style={styles.labelName}>Título</Text>
              <TextInput
                placeholder="Título"
                value={newTest.title}
                onChangeText={(text) =>
                  setNewTest({ ...newTest, title: text })
                }
                style={styles.modalInput}
              />              

              <Text style={styles.labelName}>Descrição</Text>
              <TextInput
                multiline 
                numberOfLines={3} 
                placeholder="Descrição do questionário ..."
                value={newTest.description}
                onChangeText={(text) =>
                  setNewTest({ ...newTest, description: text })
                }
                style={styles.memoInput} 
              />

              <Text style={styles.labelName}>Instruções</Text>
              <TextInput
                multiline // Permite várias linhas de texto
                numberOfLines={4} // Número inicial de linhas visíveis
                placeholder="Instruções ao candidato de como responder o questionário ..."
                value={newTest.instruction}
                onChangeText={(text) =>
                  setNewTest({ ...newTest, instruction: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />


              {/* ======================================================================================= */}
              <View style={styles.spacing} />
              <Text style={styles.modalTitle}>Questões</Text>

              <View>
                {/* Lista de questões selecionadas */}
                {selectedQuestions.map((question, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={question.status===2 ? styles.newItemColor : styles.commonItemColor}>{question.description}</Text>
                    <TouchableOpacity onPress={() => handleDeselectQuestion(question.id)}>
                      <Feather
                        style={styles.actionButtonText}
                        name="delete"
                        size={24}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Botão para adicionar nova questão */}
                <TouchableOpacity
                  style={styles.modalMiniButtonArea}
                  onPress={toggleQuestionModal}
                >
                  <Feather
                    style={styles.actionButtonText}
                    name="plus-circle"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>

                {/* Modal de seleção de questões */}
                <Modal visible={isQuestionModalVisible} animationType="fade" transparent>
                  <View style={styles.modalOverlay}>
                    <ScrollView style={styles.scrollViewSpace}>
                      <View style={styles.modalContent}>
                        <Text style={styles.labelName}>Selecionar Questões:</Text>
                        <View style={styles.spacing} />
                          {questions.map((question) => (
                            <TouchableOpacity key={question.id} onPress={() => handleSelectQuestion(question.id)}>
                              <Text style={question.status===4 ? styles.removedItemColor : styles.commonItemColor}>{question.description}</Text>
                            </TouchableOpacity>
                          ))}
                        <TouchableOpacity onPress={toggleQuestionModal}>
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
                  onPress={handleCreateTest}
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
      
      {/* Modal UPDATE TEST */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.scrollViewSpace}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Questionário</Text>         

              <Text style={styles.labelName}>Título</Text>
              <TextInput
                placeholder="Título"
                value={selectedTest ? selectedTest.title : ""}
                onChangeText={(text) =>
                  setNewTest({ ...selectedTest, title: text })
                }
                style={styles.modalInput}
              />              

              <Text style={styles.labelName}>Descrição</Text>
              <TextInput
                multiline 
                numberOfLines={3} 
                placeholder="Descrição do questionário ..."
                value={selectedTest ? selectedTest.description : ""}
                onChangeText={(text) =>
                  setNewTest({ ...selectedTest, description: text })
                }
                style={styles.memoInput} 
              />

              <Text style={styles.labelName}>Instruções</Text>
              <TextInput
                multiline 
                numberOfLines={4} 
                placeholder="Instruções ao candidato de como responder o questionário ..."
                value={selectedTest ? selectedTest.instruction : ""}
                onChangeText={(text) =>
                  setNewTest({ ...selectedTest, instruction: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />

              {/* ======================================================================================= */}
              <View style={styles.spacing} />
              <Text style={styles.modalTitle}>Questões</Text>

              <View>
                {/* Lista de testes selecionados */}
                {selectedQuestions.map((question, index) => (
                  <View key={index} style={styles.listItem}>
                    <Text style={question.status===2 ? styles.newItemColor : styles.commonItemColor}>{question.description}</Text>
                    <TouchableOpacity onPress={() => handleDeselectQuestion(question.id)}>
                      <Feather
                        style={styles.actionButtonText}
                        name="delete"
                        size={24}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Botão para adicionar nova questão */}
                <TouchableOpacity
                  style={styles.modalMiniButtonArea}
                  onPress={toggleQuestionModal}
                >
                  <Feather
                    style={styles.actionButtonText}
                    name="plus-circle"
                    size={24}
                    color="#007AFF"
                  />
                </TouchableOpacity>

                {/* Modal de seleção de questões */}
                <Modal visible={isQuestionModalVisible} animationType="fade" transparent>
                  <View style={styles.modalOverlay}>
                    <ScrollView style={styles.scrollViewSpace}>
                      <View style={styles.modalContent}>
                        <Text style={styles.labelName}>Selecionar Questões:</Text>
                        <View style={styles.spacing} />
                          {questions.map((question) => (
                            <TouchableOpacity key={question.id} onPress={() => handleSelectQuestion(question.id)}>
                              <Text style={question.status===4 ? styles.removedItemColor : styles.commonItemColor}>{question.description}</Text>
                            </TouchableOpacity>
                          ))}
                        <TouchableOpacity onPress={toggleQuestionModal}>
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
                  onPress={handleEditTest}
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

      {/* Modal DELETE TEST */}
      <Modal visible={deleteModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentDelete}>
            <Text style={styles.modalText}>
              Deseja mesmo remover o questionário?
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                onPress={handleDeleteTest}
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
  listItem: {
    flexDirection: "row", // Alinha os elementos em uma linha
    justifyContent: "space-between", // Espaço entre os elementos
    alignItems: "center", // Alinha os elementos verticalmente
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 8,
  },
  itemInfo: {
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
    borderColor: "#CCC",
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
  newItemColor: {
    fontWeight: "bold",
    color: 'green',
  },
  removedItemColor: {
    fontWeight: "bold",
    color: "#8B0000",   
  },
  commonItemColor: {
    fontWeight: "bold",
  },
  spacing: {
    marginBottom: 35,
  },
});

export default Tests;
