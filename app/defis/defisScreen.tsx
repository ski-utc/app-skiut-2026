import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Trophy, ChevronRight, Check, X, ListTodo, Hourglass } from 'lucide-react-native';
import { NavigationProp, useNavigation, useFocusEffect } from '@react-navigation/native';

import BoutonNavigationLarge from "@/components/divers/boutonNavigationLarge";
import BoutonRetour from "@/components/divers/boutonRetour";
import { Colors, TextStyles } from '@/constants/GraphSettings';
import { apiGet, isSuccessResponse, handleApiErrorScreen } from "@/constants/api/apiCalls";
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import Header from "../../components/header";
import { DefisStackParamList } from '../defisNavigator';

type Challenge = {
  id: number;
  title: string;
  nbPoints: number;
  status: 'todo' | 'pending' | 'done' | 'refused';
}

type BoutonDefiProps = {
  defi: Challenge;
  onUpdate: (id: number, status: string) => void;
}

const BoutonDefi: React.FC<BoutonDefiProps> = ({ defi, onUpdate }) => {
  const navigation = useNavigation<NavigationProp<DefisStackParamList>>();

  const onPress = () => {
    navigation.navigate("defisInfos", {
      id: defi.id,
      title: defi.title,
      points: defi.nbPoints,
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
      style={styles.defiCard}
    >
      <View style={styles.defiLeft}>
        <View style={styles.statusIcon}>{getStatusIcon(defi.status)}</View>
        <View style={styles.defiRight}>
          <Text style={styles.defiTitle}>{defi.title}</Text>
          <Text style={styles.defiSubtitle}>{getStatusText(defi.status)} • {defi.nbPoints} pts</Text>
        </View>
      </View>
      <ChevronRight size={22} color={Colors.primaryBorder} />
    </TouchableOpacity>
  );
};

export default function Defis() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState('');

  const { setUser } = useUser();

  const fetchChallenges = useCallback(async () => {
    setError('');

    try {
      const response = await apiGet<Challenge[]>("challenges");

      if (isSuccessResponse(response) && response.data) {
        setChallenges(response.data);
      }
    } catch (err: unknown) {
      handleApiErrorScreen(err, setUser, setError);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
    }, [fetchChallenges])
  );

  const onUpdateDefiStatus = (updatedDefiId: number, newStatus: string) => {
    const validStatus = newStatus as Challenge['status'];

    setChallenges((prevChallenges) =>
      prevChallenges.map((challenge) =>
        challenge.id === updatedDefiId
          ? { ...challenge, status: validStatus }
          : challenge
      )
    );
  };

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading && challenges.length === 0) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchChallenges} disableRefresh={false} />
      <View style={styles.headerContainer}>
        <BoutonRetour title={"Défis"} />
      </View>

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id.toString()}
        extraData={challenges}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => <View style={styles.footerSeparator} />}
        renderItem={({ item }) => (
          <BoutonDefi
            defi={item}
            onUpdate={onUpdateDefiStatus}
          />
        )}
        style={styles.list}
      />

      <View style={styles.navigationContainer}>
        <BoutonNavigationLarge
          nextRoute={"defisClassement"}
          title={"Classement"}
          IconComponent={Trophy}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Colors.white,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  defiCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: Colors.white,
    borderColor: "rgba(0,0,0,0.06)",
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    width: "100%",
  },
  defiLeft: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
  },
  defiRight: {
    flex: 1
  },
  defiSubtitle: {
    color: Colors.muted,
    fontSize: 13,
    marginTop: 2,
  },
  defiTitle: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontSize: 16,
    fontWeight: "600",
  },
  footerSeparator: {
    height: 20
  },
  headerContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  list: {
    flex: 1,
    width: "100%",
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  loadingContainer: {
    alignItems: "center",
    backgroundColor: Colors.white,
    display: "flex",
    height: "100%",
    justifyContent: "center",
    width: "100%",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16
  },
  navigationContainer: {
    backgroundColor: Colors.white,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    width: '100%',
  },
  statusIcon: {
    marginRight: 14,
  },
});
