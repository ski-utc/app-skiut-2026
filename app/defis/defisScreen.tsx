import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import Header from "../../components/header";
import { Trophy, ChevronRight, Check, X, ListTodo, Hourglass } from 'lucide-react-native';
import BoutonNavigationLarge from "@/components/divers/boutonNavigationLarge";
import BoutonRetour from "@/components/divers/boutonRetour";
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { apiGet } from "@/constants/api/apiCalls";
import ErrorScreen from '@/components/pages/errorPage';
import { useNavigation } from 'expo-router';
import { useUser } from '@/contexts/UserContext';

interface BoutonDefiProps {
  defi: {
    id: number,
    title: string,
    points: number,
    status: string,
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <Check size={22} color={Colors.success} strokeWidth={3} />;
      case 'refused':
        return <X size={22} color={Colors.error} strokeWidth={3} />;
      case 'pending':
        return <Hourglass size={22} color={Colors.primary} strokeWidth={3} />;
      default:
        return <ListTodo size={22} color={Colors.muted} strokeWidth={3} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'done': return 'Validé';
      case 'refused': return 'Refusé';
      case 'pending': return 'En attente';
      default: return 'À faire';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.defiCard,
        { backgroundColor: Colors.white }
      ]}
    >
      <View style={styles.defiLeft}>
        <View style={styles.statusIcon}>{getStatusIcon(defi.status)}</View>
        <View style={{ flex: 1 }}>
          <Text style={styles.defiTitle}>{defi.title}</Text>
          <Text style={styles.defiSubtitle}>{getStatusText(defi.status)} • {defi.points} pts</Text>
        </View>
      </View>
      <ChevronRight size={22} color={Colors.primaryBorder} />
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
    } catch (error: any) {
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

  const onUpdateDefiStatus = (updatedDefiId: number, newStatus: string) => {
    setChallenges((prevChallenges) =>
      prevChallenges.map((challenge) =>
        challenge.id === updatedDefiId
          ? { ...challenge, status: newStatus }
          : challenge
      )
    );
  };

  useEffect(() => {
fetchChallenges();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchChallenges();
    });

    return unsubscribe;
  }, [navigation, fetchChallenges]);

  if (error) {
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.white,
      }}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
            Chargement...
          </Text>
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
        keyExtractor={(item) => item.id.toString()}
        extraData={challenges}
        ListFooterComponent={<View style={{ height: 70 }} />}
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
        <BoutonNavigationLarge nextRoute={"defisClassement"} title={"Classement"} IconComponent={Trophy} />
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
  },
  defiCard: {
    width: "94%",
    alignSelf: "center",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: Colors.white,
  },
  defiLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusIcon: {
    marginRight: 14,
  },
  defiTitle: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: "600",
    fontSize: 16,
  },
  defiSubtitle: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
});