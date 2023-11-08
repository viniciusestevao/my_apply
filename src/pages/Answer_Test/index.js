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


const CustomRadioButton = ({ options, selectedOption, onSelectOption }) => {
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
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

function Answer_Test() {
  const [applyTests, setApplyTests] = useState([]);
  
  const [answerTestModalVisible, setAnswerTestModalVisible] = useState(false);
  const [currentApplyTest, setCurrentApplyTest] = useState({});
  
  const [selectedOptions, setSelectedOptions] = useState({});
  const [dissertativeResponses, setDissertativeResponses] = useState({});


// Inicializa selectedOptions com as seleções padrão vazias
  useEffect(() => {
    const initialSelectedOptions = {};
    applyTests.forEach((applyTest) => {
      applyTest.test_items.forEach((testItem) => {
        if (testItem.type_question === 'alternative') {
          initialSelectedOptions[testItem.id] = null;
        }
      });
    });
    setSelectedOptions(initialSelectedOptions);
  }, [applyTests]);


  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return token;
    } catch (error) {
      console.error('Erro ao recuperar o token de autenticação:', error);
      return null;
    }
  };

  const processTestItemBody = (testItem) => {
    try {
      const validJson = testItem.body.replace(/'/g, '"');
      const parsedBody = JSON.parse(validJson);
  
      if (Array.isArray(parsedBody)) {
        const options = parsedBody.map((item) => item.text);
        return options;
      } else {
        console.error('O campo body de test_item não é um array de objetos JSON válido.');
        return [];
      }
    } catch (error) {
      console.error('Erro ao analisar o campo body de test_item:', error);
      return [];
    }
  };
  
  const fetchApplyTests = async () => {
    try {
      const token = await getAuthToken();
      
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/apply_tests/?token=${token}`);
        const applyTestsData = response.data;

        const applyTestsWithProcessedItems = applyTestsData.map((applyTest) => {
          if (applyTest && applyTest.test_items) {
            const processedItems = applyTest.test_items.map((testItem) => {
              if (testItem) {
                const processedItem = processTestItemBody(testItem);
                return { ...testItem, processedItem };
              }
              return testItem;
            });
        
            return { ...applyTest, test_items: processedItems };
          } else {
            // Se applyTest.test_items for vazio ou inexistente, atribua um array vazio a ele
            return { ...applyTest, test_items: [] };
          }
        });
        // console.log("applyTestsWithProcessedItems -> ", applyTestsWithProcessedItems);
        setApplyTests(applyTestsWithProcessedItems);

      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error("Erro ao buscar questionários:", error);
    }
  };

  useEffect(() => {
    fetchApplyTests();
  }, []);

  useEffect(() => {
    // console.log("applyTests -> ", applyTests);
    // console.log("currentApplyTest -> ", currentApplyTest);
  }, [applyTests]); 


  const handleSaveResponses = async () => {
    try {
      const token = await getAuthToken();
  
      if (token) {
        const answersToUpdate = {};
        // Adicione respostas dissertativas, se houver
        if (dissertativeResponses) {
          Object.keys(dissertativeResponses).forEach((id) => {
            answersToUpdate[id] = {
              candidate_answer: dissertativeResponses[id],
            };
          });
        }
        // Adicione respostas das questões de múltipla escolha, se houver
        if (selectedOptions) {
          Object.keys(selectedOptions).forEach((id) => {
            answersToUpdate[id] = {
              candidate_answer: selectedOptions[id],
            };
          });
        }
        await axios.post(`${API_BASE_URL}/test_items?token=${token}`, { answersToUpdate } );
        fetchApplyTests();
        setAnswerTestModalVisible(false);
      } else {
        console.error('Token de autenticação ausente ou inválido.');
      }
    } catch (error) {
      console.error('Erro ao atualizar respostas:', error);
    }
  };

  const handleOptionSelect = (id, option) => {
    setSelectedOptions((prevSelectedOptions) => ({
      ...prevSelectedOptions,
      [id]: option,
    }));
  };


  const callFetch = async () => {
    fetchApplyTests();
  }


  const handleEditModalVisible = (isVisible, applyTest) => {
    setAnswerTestModalVisible(isVisible);
    setCurrentApplyTest(applyTest);
    // console.log("handleEditModalVisible ||| currentApplyTest -> ", currentApplyTest.test_items);
  };


  const updateDissertativeResponse = (testItemId, response) => {
    setDissertativeResponses((prevResponses) => ({
      ...prevResponses,
      [testItemId]: response,
    }));
  };
  

  return (
    <Container>
      <Header title="Responder Questionários" />
      <Texto>Selecione um questionário: </Texto>
      <View style={styles.spacing} />

          {/* <TouchableOpacity
            style={styles.actionButton}
            onPress={() => callFetch()}
          >
            <Text style={styles.modalButtonText}>RECARREGAR</Text>
          </TouchableOpacity> */}

      <View style={styles.container}>
        <FlatList
          data={applyTests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            // <View style={styles.container}>
              <View style={styles.questionItem}>
                <View style={styles.questionInfo}>
                  <Text style={styles.primary}>{item.title} - {item.description}</Text>
                  {/* <Text style={styles.secundary}>{item.instruction}</Text> */}
                  <Text style={styles.secundary}>Candidato: {item.candidate_name}</Text>
                  <Text style={styles.secundary}>Recrutador: {item.recruiter_name}</Text>
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
                </View>
              </View>
            // </View>
          )}
        />
      </View>


      {/* Modal ANSWER TEST */}
      <Modal visible={answerTestModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          {/* <ScrollView style={styles.scrollViewSpace}> */}
            <View style={styles.modalContent}>
              {/* <View style={styles.questionItem}> */}

                <Text style={styles.modalTitle}>{currentApplyTest ? currentApplyTest.title : ""}</Text>

                <View style={styles.questionItem}>
                  <View style={styles.questionInfo}>
                    <Text style={styles.primary}>{currentApplyTest ? currentApplyTest.description : ""}</Text>
                    <Text style={styles.secundary}>{currentApplyTest ? currentApplyTest.instruction : ""}</Text>
                    <View style={styles.spacing} />
                    <Text style={styles.primary}> QUESTÕES :</Text>
                    <View style={styles.miniSpacing} />
                  </View>
                </View>
                            

                <FlatList
                  data={currentApplyTest.test_items}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.questionItem}>
                      <View style={styles.questionInfo}>
                        <Text style={styles.primary}>  *  {item.description}</Text>
                        <View style={styles.miniSpacing} />

                        {item.question_type === "alternative" && (
                          <CustomRadioButton
                            key={item.id}
                            options={item.processedItem}
                            selectedOption={selectedOptions[item.id]}
                            onSelectOption={(option) => handleOptionSelect(item.id, option)}
                          />  
                        )}
                        {item.question_type === "dissertative" && (
                          <View>
                            <Text style={styles.labelName}>Resposta:</Text>
                            <TextInput
                              multiline 
                              numberOfLines={5} 
                              placeholder="Sua resposta..."
                              value={dissertativeResponses[item.id] || ''}
                              onChangeText={(text) => updateDissertativeResponse(item.id, text)}
                              style={styles.memoInput} // Estilos personalizados se necessário
                            />
                          </View>
                        )}

                      </View>
                    </View>
                  )}
                />

              {/* </View> */}

              {/* ======================================================================================= */}

              <View style={styles.spacing} />
              <View style={styles.modalButtonGroup}>
                <Button
                  title="Salvar"
                  onPress={handleSaveResponses }
                  color="#007AFF"
                />
                <Button
                  title="Cancelar"
                  onPress={() => setAnswerTestModalVisible(false)}
                  color="#A0ABDF"
                />
              </View>
            </View>
          {/* </ScrollView> */}
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
    borderColor: "#8FBBCF",
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
  miniSpacing: {
    marginBottom: 20,
  },
});

export default Answer_Test;
