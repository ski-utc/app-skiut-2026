import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  FlatList,
  ScrollView,
} from 'react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import {
  apiGet,
  isSuccessResponse,
  handleApiErrorScreen,
} from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import BoutonRetour from '../../components/divers/boutonRetour';
import Header from '../../components/header';

type Navette = {
  id: number;
  departure: string;
  arrival: string;
  horaire_depart: string;
  horaire_arrivee: string;
  colour?: string;
  colourName?: string;
};

type NavettesMap = {
  Aller: Navette[];
  Retour: Navette[];
};

type NavettesResponse = Record<string, Navette[]>;

type NavettesTabProps = {
  navettesMap: NavettesMap;
};

const NavettesTab: React.FC<NavettesTabProps> = ({ navettesMap }) => {
  const renderNavetteCard = (type: 'Aller' | 'Retour', navettes: Navette[]) => (
    <View style={navettesStyles.cardContainer}>
      <Text style={navettesStyles.cardTitle}>{type}</Text>
      {navettes.length > 0 ? (
        <FlatList
          data={navettes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={navettesStyles.navetteContainer}>
              <View
                style={[
                  navettesStyles.navetteIndicator,
                  { backgroundColor: item.colour || Colors.primaryBorder },
                ]}
              />
              <View style={navettesStyles.navetteDetails}>
                <Text style={navettesStyles.navetteText}>
                  {item.departure} → {item.arrival}
                </Text>
                <Text style={navettesStyles.navetteTimeText}>
                  {item.horaire_depart} - {item.horaire_arrivee}
                </Text>
                {item.colourName && (
                  <Text style={navettesStyles.navetteCouleurText}>
                    Navette {item.colourName}
                  </Text>
                )}
              </View>
            </View>
          )}
          scrollEnabled={false}
        />
      ) : (
        <View style={navettesStyles.emptyContainer}>
          <Text style={navettesStyles.emptyText}>
            Aucune navette {type.toLowerCase()} disponible.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={navettesStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={navettesStyles.innerContainer}>
        {renderNavetteCard('Aller', navettesMap.Aller)}
        {renderNavetteCard('Retour', navettesMap.Retour)}
      </View>
    </ScrollView>
  );
};

const navettesStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  cardTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
  },
  innerContainer: {
    flex: 1,
  },
  navetteContainer: {
    alignItems: 'center',
    borderBottomColor: Colors.lightMuted,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  navetteCouleurText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  navetteDetails: {
    flex: 1,
  },
  navetteIndicator: {
    borderRadius: 2,
    height: '100%',
    marginRight: 12,
    minHeight: 40,
    width: 4,
  },
  navetteText: {
    ...TextStyles.h4,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginBottom: 4,
  },
  navetteTimeText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginBottom: 2,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
});

export default function NavettesScreen() {
  const [navettesMap, setNavettesMap] = useState<NavettesMap>({
    Aller: [],
    Retour: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const { setUser } = useUser();

  const fetchNavettes = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      try {
        const response = await apiGet<NavettesResponse>('navettes');

        if (isSuccessResponse(response)) {
          const map: NavettesMap = {
            Aller: [],
            Retour: [],
          };

          if (response.data) {
            if (Array.isArray(response.data['Aller']))
              map.Aller = response.data['Aller'];
            if (Array.isArray(response.data['Retour']))
              map.Retour = response.data['Retour'];
          }

          setNavettesMap(map);
        }
      } catch (err: unknown) {
        handleApiErrorScreen(err, setUser, setError);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [setUser],
  );

  useEffect(() => {
    fetchNavettes();
  }, [fetchNavettes]);

  if (error) {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        refreshFunction={() => fetchNavettes(true)}
        disableRefresh={refreshing}
      />

      <View style={styles.headerContainer}>
        <BoutonRetour title="Vos Navettes" />
      </View>

      <NavettesTab navettesMap={navettesMap} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    width: '100%',
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
});
