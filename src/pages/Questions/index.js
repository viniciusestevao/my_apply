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
  Alert, 
} from "react-native";
import axios from "axios";
import API_BASE_URL from "../../apiConfig";

import { Feather } from "@expo/vector-icons";

import { Container, Texto } from "../Home/styles";
import Header from "../../components/Header";

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native-paper';


const CustomRadioButton = ({ options, selectedOption, onSelectOption, onRemoveOption }) => {
  return (
    <View>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          onPress={() => onSelectOption(option)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              borderWidth: 2,
              borderColor: selectedOption === option ? 'blue' : 'gray',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {selectedOption === option && (
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'blue',
                }}
              />
            )}

            

          </View>
          
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ marginLeft: 10, flex: 1 }}>{option}</Text>
            <TouchableOpacity
              key={option}
              style={styles.modalMiniButtonArea}
              onPress={() => onRemoveOption(option)}
            >
              <Feather
                style={styles.actionButtonText}
                name="delete"
                size={24}
                color="#FF3B30"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};


function Questions() {
  const [questions, setQuestions] = useState([]);
  
  const [options, setOptions] = useState([]); // Lista de optiones disponíveis
  const [newOption, setNewOption] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const [questionType, setQuestionType] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isOptionListVisible, setIsOptionListVisible] = useState(false); // Estado para controlar a visibilidade do modal
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    tag: "",
    description: "",
    instruction: "",
    question_type: "",
    answer: "",
    body: "",
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

  const fetchQuestions = async () => {
    try {
      const token = await getAuthToken();
      
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/questions/?token=${token}`); 
        setQuestions(response.data);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao buscar questões:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const toggleSwitch = () => {
    setQuestionType(!questionType);
    setIsOptionListVisible(!questionType); 
  };

  const handleCreateQuestion = async () => {
    try {
      const token = await getAuthToken();
      console.log(newQuestion.answer);
      if (token) {
        const questionTypeValue = questionType ? "alternative" : "dissertative"; // Verifica o valor de questionType

        const questionData = { question: {
          tag: newQuestion.tag,
          description: newQuestion.description,
          instruction: newQuestion.instruction,
          question_type: questionTypeValue, 
          answer: newQuestion.answer,
          body: buildQuestionBody(options, selectedOption),
        }};
        console.log(questionData);

        const response = await axios.post(`${API_BASE_URL}/questions/?token=${token}`, questionData);

        if (response.status === 201) {
          setIsModalVisible(false);
          setNewQuestion({ tag: "", description: "", instruction: "", question_type: "", body: "", answer: ""});
          // toggleSwitch(response.data.question_type !== "alternative");
          toggleSwitch(true);
          fetchQuestions();

        } else {
          console.log("Erro ao criar questão:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }  
    } catch (error) {
      fetchQuestions();
      // setSelectedOptions(null);
      console.error("Erro ao criar questão:", error.message);
    }
  };

  const buildQuestionBody = (options, selectedOption) => {
    // Converte as alternativas em um formato desejado
    const formattedOptions = options.map((option) => ({
      text: option,
      right: option === selectedOption,
    }));
    const questionBody = JSON.stringify(formattedOptions).replace(/"/g, "'");
    return questionBody;
  };
  
  const convertBodyToOptions = (body) => {
    try {
      const parsedBody = JSON.parse(body);
  
      if (Array.isArray(parsedBody)) {
        const options = parsedBody.map((item) => item.text);
        const rightOption = parsedBody.find((item) => item.right === true);
        return { options, rightOption };
      } else {
        console.error('O campo body não é um array de objetos JSON válido.');
        return { options: [], rightOption: null };
      }
    } catch (error) {
      console.error('Erro ao analisar o campo body:', error);
      return { options: [], rightOption: null };
    }
  };

  const handleEditModalVisible = (isVisible, question) => {
    setEditModalVisible(isVisible);
    setSelectedQuestion(question);

    const validJson = question.body.replace(/'/g, '"');
    const { options, rightOption } = convertBodyToOptions(validJson);
    setOptions(options); // Defina as alternativas no estado options
    if (rightOption){
      setSelectedOption(rightOption.text); // Defina a alternativa correta no estado selectedOption
    }
    console.log(question.question_type);
    if ((question.question_type === "dissertative" && questionType) || (question.question_type === "alternative" && !questionType))
    {
      toggleSwitch();
    }
  };

  const handleEditQuestion = async () => {
    try {
      const token = await getAuthToken();
      console.log(selectedQuestion.answer);

      if (token) {
        const questionTypeValue = questionType ? "alternative" : "dissertative"; // Verifica o valor de questionType

        questionData = { question: {
          tag: selectedQuestion.tag,
          description: selectedQuestion.description,
          instruction: selectedQuestion.instruction,
          question_type: questionTypeValue,
          answer: selectedQuestion.answer,
          body: buildQuestionBody(options, selectedOption),
        }};
        console.log(questionData);

        await axios.put(`${API_BASE_URL}/questions/${selectedQuestion.id}/?token=${token}`, questionData);
        setNewQuestion({ tag: "", description: "", question_type: "", instruction: "", answer: ""});
        fetchQuestions();
        setEditModalVisible(false);
        setSelectedQuestion(null);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao atualizar questão:", error);
    }
  };

  const handleDeleteModalVisible = (isVisible, question) => {
    setDeleteModalVisible(isVisible);
    setSelectedQuestion(question);
  };

  const handleDeleteQuestion = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        const response = await axios.delete(`${API_BASE_URL}/questions/${selectedQuestion.id}/?token=${token}`);

        if (response.status === 204) {
          fetchQuestions(); // Atualiza a lista de usuários após a exclusão
          setDeleteModalVisible(false);
          setSelectedQuestion(null);
        } else {
          console.log("Erro ao remover questão:", response.data.message);
        }
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      } 
    } catch (error) {
      console.error("Erro ao remover questão:", error);
    }
  };


  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleOptionRemove = (optionItem) => {
    setOptions(options.filter((option) => option !== optionItem));
  };
  
  const handleTextChange = (text) => {
    setNewOption(text);
  };

  const addOption = async () => {
    // const selectedQuestion = questions.find((question) => question.id === questionId);
    if (newOption) {
      // setQuestions(questions.filter((question) => question.id !== questionId));
      const optionExists = options.some((option) => option === newOption);

      if (optionExists) {
        Alert.alert('Duplicidade', 'Esta alternativa já existe.');
      } else {
        // Adicione a nova opção à lista e limpe o campo de entrada
        setOptions([...options, newOption]);
        setNewOption('');
      }
    }
  };


  return (
    <Container>
      <Header title="Questões" />
      <Texto>Lista de questões cadastradas</Texto>

      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.modalButtonText}>NOVA QUESTÃO</Text>
      </TouchableOpacity>
    
      <View style={styles.container}>
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.questionItem}>
              <View style={styles.questionInfo}>
                <Text style={styles.primary}>{item.tag} - {item.description}</Text>
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

      {/* Modal CREATE QUESTION */}
      <Modal visible={isModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.scrollViewSpace}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Adicionar Questão</Text>

            
              <Text style={styles.labelName}>Códigos</Text>
              <TextInput
                multiline // Permite várias linhas de texto
                numberOfLines={2} // Número inicial de linhas visíveis
                placeholder="Informe TAGs para pesquisas rápidas"
                value={newQuestion.tag}
                onChangeText={(text) =>
                  setNewQuestion({ ...newQuestion, tag: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />

              <Text style={styles.labelName}>Descrição</Text>
              <TextInput
                multiline // Permite várias linhas de texto
                numberOfLines={4} // Número inicial de linhas visíveis
                placeholder="Enunciado da questão"
                value={newQuestion.description} //
                onChangeText={(text) =>
                  setNewQuestion({ ...newQuestion, description: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />

              <View style={styles.inputContainer}>
                <Text style={styles.labelName}>Questão de múltipla escolha</Text>
                <Switch value={questionType} onValueChange={toggleSwitch}/>
              </View>
              <View style={styles.spacing} />

              {/* ======================================================================================= */}
              {!isOptionListVisible && (
                <View animationType="fade" transparent>
                  <Text style={styles.labelName}>Resposta</Text>
                  <TextInput
                    multiline 
                    numberOfLines={5} 
                    placeholder="Informe a resposta esperada para esta questão"
                    value={newQuestion.answer} //
                    onChangeText={(text) =>
                      setNewQuestion({ ...newQuestion, answer: text })
                    }
                    style={styles.memoInput} // Estilos personalizados se necessário
                  />
                  <View style={styles.spacing} />
                </View>
              )}
            {/* ======================================================================================= */}
              {isOptionListVisible && (
                <View animationType="fade" transparent>
                  {/* <Text style={styles.modalTitle}>Alternativas</Text> */}

                  <View>
                    {/* Botão para adicionar nova alternativa */}
                    <Text style={styles.labelName}>Nova Alternativa</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        onChangeText={(text) => handleTextChange(text)}
                        placeholder="Digite um texto para a nova alternativa"
                        style={styles.modalInput}
                        value={newOption}
                      />
                      <TouchableOpacity
                        style={styles.modalMiniButtonArea}
                        onPress={addOption}
                      >
                        <Feather
                          style={styles.actionButtonText}
                          name="plus-circle"
                          size={24}
                          color="#007AFF"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.spacing} />

                    <CustomRadioButton
                      options={options}
                      selectedOption={selectedOption}
                      onSelectOption={handleOptionSelect}
                      onRemoveOption={handleOptionRemove}
                    />
                    {/* <Text>Selected Option: {selectedOption}</Text> */}

                  </View>
                  <View style={styles.spacing} />
                </View>
              )}
              {/* ======================================================================================= */}

              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleCreateQuestion}
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

      {/* Modal UPDATE QUESTION */}
      <Modal visible={editModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.scrollViewSpace}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Questão</Text>

              <Text style={styles.labelName}>Códigos</Text>
              <TextInput
                multiline // Permite várias linhas de texto
                numberOfLines={2} // Número inicial de linhas visíveis
                placeholder="Informe TAGs para pesquisas rápidas"
                value={selectedQuestion ? selectedQuestion.tag : ""}
                onChangeText={(text) =>
                  setSelectedQuestion({ ...selectedQuestion, tag: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />

              <Text style={styles.labelName}>Descrição</Text>
              <TextInput
                multiline // Permite várias linhas de texto
                numberOfLines={4} // Número inicial de linhas visíveis
                placeholder="Enunciado da questão"
                value={selectedQuestion ? selectedQuestion.description : ""}
                onChangeText={(text) =>
                  setSelectedQuestion({ ...selectedQuestion, description: text })
                }
                style={styles.memoInput} // Estilos personalizados se necessário
              />


              <View style={styles.inputContainer}>
                <Text style={styles.labelName}>Questão de múltipla escolha</Text>
                <Switch value={questionType} onValueChange={toggleSwitch}/>
              </View>
              <View style={styles.spacing} />

              {/* ======================================================================================= */}
              {!isOptionListVisible && (
                <View animationType="fade" transparent>
                  <Text style={styles.labelName}>Resposta</Text>
                  <TextInput
                    multiline 
                    numberOfLines={5} 
                    placeholder="Informe a resposta esperada para esta questão"
                    value={selectedQuestion ? selectedQuestion.answer : ""} //
                    onChangeText={(text) =>
                      setSelectedQuestion({ ...selectedQuestion, answer: text })
                    }
                    style={styles.memoInput} // Estilos personalizados se necessário
                  />
                <View style={styles.spacing} />
              </View>
            )}
            {/* ======================================================================================= */}
              {isOptionListVisible && (
                <View animationType="fade" transparent>
                  {/* <Text style={styles.modalTitle}>Alternativas</Text> */}

                  <View>
                    {/* Botão para adicionar nova alternativa */}
                    <Text style={styles.labelName}>Nova Alternativa</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        onChangeText={(text) => handleTextChange(text)}
                        placeholder="Digite um texto para a nova alternativa"
                        style={styles.modalInput}
                        value={newOption}
                      />
                      <TouchableOpacity
                        style={styles.modalMiniButtonArea}
                        onPress={addOption}
                      >
                        <Feather
                          style={styles.actionButtonText}
                          name="plus-circle"
                          size={24}
                          color="#007AFF"
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.spacing} />

                    <CustomRadioButton
                      options={options}
                      selectedOption={selectedOption}
                      onSelectOption={handleOptionSelect}
                      onRemoveOption={handleOptionRemove}
                    />
                    {/* <Text>Selected Option: {selectedOption}</Text> */}

                  </View>
                  <View style={styles.spacing} />
                </View>
              )}
              {/* ======================================================================================= */}


              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleEditQuestion}
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
              Deseja mesmo remover a questão ?
            </Text>
            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                onPress={handleDeleteQuestion}
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
  questionItem: {
    flexDirection: "row", // Alinha os elementos em uma linha
    justifyContent: "space-between", // Espaço entre os elementos
    alignItems: "center", // Alinha os elementos verticalmente
    marginBottom: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 8,
  },
  questionInfo: {
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
    marginLeft: 10, 
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1, // Isso fará com que o campo ocupe o espaço disponível
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
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
  newOption: {
    fontWeight: "bold",
    color: 'green',
  },
  removedOption: {
    fontWeight: "bold",
    color: "#8B0000",   
  },
  commonOption: {
    fontWeight: "bold",
  },
  spacing: {
    marginBottom: 35,
  },
});

export default Questions;
