import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Modal, FlatList, StatusBar } from "react-native";
import { Fonts, Colors } from "@/constants/GraphSettings";
import { BlurView } from "expo-blur";
import { CircleX } from "lucide-react-native";
import { useEffect, useState } from "react";
import { apiGet } from "@/constants/api/apiCalls";
import { useUser } from "@/contexts/UserContext";

// @ts-ignore
export default function NotificationPopup({ visible, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useUser();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await apiGet('getNotifications');
      if (response.success) {
        setNotifications(response.data); 
      } else {
        setError('Une erreur est survenue lors de la récupération des notifications');
      }
    } catch (error) {
      if (error.name === 'JWTError') {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (error!='') {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
          <StatusBar style="light" translucent={true} backgroundColor="rgba(0,0,0,0.2)" />
          <BlurView 
              intensity={20} 
              tint="dark" 
              style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  justifyContent: "center",
                  alignItems: "center",
              }} 
              experimentalBlurMethod="blur"
          >
          <View
            style={{
              backgroundColor: "white",
              width: "85%",
              height: '85%',
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 15,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: "#EAEAEA",
                paddingBottom: 10,
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontFamily: Fonts.Inter.Basic,
                  fontWeight: '800',
                  color: Colors.customBlack,
                }}
              >
                Notifications
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                height: "70%",
                flex: 1,
                backgroundColor: Colors.white,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: Colors.black,
                  fontSize: 32,
                  fontFamily: Fonts.Inter.Basic,
                  fontWeight: "800",
                  padding: 10,
                  textAlign: "center",
                }}
              >
                Une erreur est survenue...
              </Text>
              <Text
                style={{
                  color: Colors.black,
                  fontSize: 20,
                  fontFamily: Fonts.Inter.Basic,
                  fontWeight: "400",
                  padding: 10,
                  paddingBottom: 32,
                  textAlign: "center",
                }}
              >
                {error}
              </Text>
              <Text
                style={{
                  color: Colors.black,
                  fontSize: 16,
                  fontFamily: Fonts.Inter.Italic,
                  fontWeight: "400",
                  padding: 16,
                  textAlign: "center",
                }}
              >
                Si l'erreur persiste, merci de contacter Louise Caignaert ou Mathis Delmaere
              </Text>
            </View>
            <View
              style={{
                marginTop: 15,
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: "#EAEAEA",
                paddingTop: 10,
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: Colors.customBlack,
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <CircleX size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  }

  if (loading) {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
          <StatusBar style="light" translucent={true} backgroundColor="rgba(0,0,0,0.2)" />
          <BlurView 
              intensity={20} 
              tint="dark" 
              style={{
                  flex: 1,
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  justifyContent: "center",
                  alignItems: "center",
              }} 
              experimentalBlurMethod="blur"
          >
          <View
            style={{
              backgroundColor: "white",
              width: "85%",
              height: '85%',
              borderRadius: 20,
              paddingVertical: 20,
              paddingHorizontal: 15,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: "#EAEAEA",
                paddingBottom: 10,
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontFamily: Fonts.Inter.Basic,
                  fontWeight: '800',
                  color: Colors.customBlack,
                }}
              >
                Notifications
              </Text>
            </View>
            <View
              style={{
                width: "100%",
                height: "70%",
                flex: 1,
                backgroundColor: Colors.white,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
             <ActivityIndicator size="large" color={Colors.black} />
            </View>
            <View
              style={{
                marginTop: 15,
                alignItems: "center",
                borderTopWidth: 1,
                borderTopColor: "#EAEAEA",
                paddingTop: 10,
              }}
            >
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 50,
                  height: 50,
                  backgroundColor: Colors.customBlack,
                  borderRadius: 25,
                  justifyContent: "center",
                  alignItems: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.2,
                  shadowRadius: 10,
                  elevation: 5,
                }}
              >
                <CircleX size={30} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    );
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
        <StatusBar style="light" translucent={true} backgroundColor="rgba(0,0,0,0.2)" />
        <BlurView 
            intensity={20} 
            tint="dark" 
            style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.1)",
                justifyContent: "center",
                alignItems: "center",
            }} 
            experimentalBlurMethod="blur"
        >
        <View
          style={{
            backgroundColor: "white",
            width: "85%",
            height: '85%',
            borderRadius: 20,
            paddingVertical: 20,
            paddingHorizontal: 15,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              borderBottomWidth: 1,
              borderBottomColor: "#EAEAEA",
              paddingBottom: 10,
              marginBottom: 15,
            }}
          >
            <Text
              style={{
                fontSize: 26,
                fontFamily: Fonts.Inter.Basic,
                fontWeight: '800',
                color: Colors.customBlack,
              }}
            >
              Notifications
            </Text>
          </View>

          <FlatList
            data={notifications}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "#F9F9F9",
                  padding: 15,
                  borderRadius: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontFamily: Fonts.Title.Bold,
                    color: Colors.customBlack,
                    marginBottom: 5,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: Fonts.Inter.Basic,
                    color: Colors.gray,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          <View
            style={{
              marginTop: 15,
              alignItems: "center",
              borderTopWidth: 1,
              borderTopColor: "#EAEAEA",
              paddingTop: 10,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 50,
                height: 50,
                backgroundColor: Colors.customBlack,
                borderRadius: 25,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.2,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <CircleX size={30} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
}
