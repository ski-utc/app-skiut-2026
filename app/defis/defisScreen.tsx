import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import Header from "../../components/header";
import { Trophy, ChevronRight, Check } from 'lucide-react-native';
import BoutonNavigation from "@/components/divers/boutonNavigation";
import BoutonRetour from "@/components/divers/boutonRetour";
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import { apiGet } from "@/constants/api/apiCalls";
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

// Composant BoutonDefi - utilisé uniquement dans cette page
interface BoutonDefiProps {
    defi: {
        id: number,
        title: string,
        points: number,
        status: string,
        [key: string]: any;
    };
    onUpdate: (id: number, status: string) => void;
}

const BoutonDefi: React.FC<BoutonDefiProps> = ({ defi, onUpdate }) => {
    const navigation = useNavigation();

    const onPress = () => {
        (navigation as any).navigate("defisInfos", {
            id: defi.id,
            title: defi.title,
            points: defi.points,
            status: defi.status,
            onUpdate
        });
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'done': return Colors.success;
            case 'refused': return Colors.error;
            case 'pending': return Colors.accent;
            default: return Colors.gray;
        }
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: "100%",
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: Colors.primary,
                justifyContent: "space-between",
                alignItems: "center",
                display: "flex",
                flexDirection: "row",
                backgroundColor: Colors.white,
            }}
        >
            <View
                style={{
                    justifyContent: "flex-start",
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "row",
                    width: '85%',
                }}
            >
                <Check
                    color={getStatusColor(defi.status)}
                    size={25}
                    strokeWidth={3}
                />
                <Text
                    style={{
                        ...TextStyles.body,
                        color: Colors.primaryBorder,
                        fontWeight: "500",
                        marginLeft: 12,
                    }}
                >
                    {defi.title}
                </Text>
            </View>
            <ChevronRight size={20} color={Colors.primaryBorder} />
        </TouchableOpacity>
    );
};

// @ts-ignore
export default function Defis() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [disableRefresh, setDisableRefresh] = useState(false);

  const navigation = useNavigation();
  const { setUser } = useUser();

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    setDisableRefresh(true);

    try {
      const response = await apiGet("challenges");
      if (response.success) {
        setChallenges(response.data);
      } else {
        setError(response.message);
      }
    } catch (error : any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  }, [setUser]);

  const onUpdateDefiStatus = (updatedDefiId, newStatus) => {
    setChallenges((prevChallenges) =>
      prevChallenges.map((challenge) =>
        challenge.id === updatedDefiId
          ? { ...challenge, status: newStatus }
          : challenge
      )
    );
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
    fetchChallenges();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChallenges();
    });

    return unsubscribe;
  }, [navigation, fetchChallenges]);

  if (error !== '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Header refreshFunction={null} disableRefresh={true} />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchChallenges} disableRefresh={disableRefresh} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute={"homeNavigator"} title={"Défis"} />
      </View>
      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id.toString()} // Use unique challenge ID
        extraData={challenges}
        renderItem={({ item }) => (
          <View>
            <BoutonDefi
              defi={{
                id: item.id,
                title: item.title,
                points: item.nbPoints,
                status: item.status
              }}
              onUpdate={onUpdateDefiStatus}
            />
          </View>
        )}
        style={styles.list}
      />
      <View style={styles.navigationContainer}>
        <BoutonNavigation nextRoute={"defisClassement"} title={"Classement"} IconComponent={Trophy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  loadingContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  list: {
    width: "100%",
  },
  navigationContainer: {
    width: '100%',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});