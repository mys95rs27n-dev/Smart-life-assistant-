import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';
import { api } from '../../utils/api';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const { width } = Dimensions.get('window');

export default function Dashboard() {
  const { stats, setStats, dailyTip, setDailyTip, tasks, setTasks, habits, setHabits } = useStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, tipData, tasksData, habitsData] = await Promise.all([
        api.getStats(),
        api.getDailyTip(),
        api.getTasks(),
        api.getHabits(),
      ]);
      setStats(statsData);
      setDailyTip(tipData);
      setTasks(tasksData);
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const activeHabits = habits.filter(h => h.streak > 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>مرحباً</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, d MMMM', { locale: ar })}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#1f2937" />
          </TouchableOpacity>
        </View>

        {/* Daily Tip Card */}
        {dailyTip && (
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb" size={24} color="#f59e0b" />
              <Text style={styles.tipTitle}>نصيحة اليوم</Text>
            </View>
            <Text style={styles.tipText}>{dailyTip.tip}</Text>
          </View>
        )}

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="checkbox" size={32} color="#3b82f6" />
            <Text style={styles.statNumber}>{stats?.completed_tasks || 0}</Text>
            <Text style={styles.statLabel}>مهمة مكتملة</Text>
          </View>
          
          <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="time" size={32} color="#f59e0b" />
            <Text style={styles.statNumber}>{stats?.pending_tasks || 0}</Text>
            <Text style={styles.statLabel}>مهمة قيد التنفيذ</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#fce7f3' }]}>
            <Ionicons name="flame" size={32} color="#ec4899" />
            <Text style={styles.statNumber}>{stats?.total_streak || 0}</Text>
            <Text style={styles.statLabel}>سلسلة العادات</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
            <Ionicons name="trophy" size={32} color="#22c55e" />
            <Text style={styles.statNumber}>{stats?.completion_rate || 0}%</Text>
            <Text style={styles.statLabel}>معدل الإنجاز</Text>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>مهام اليوم</Text>
            <Text style={styles.sectionCount}>{pendingTasks.length}</Text>
          </View>
          
          {pendingTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>لا توجد مهام معلقة! 🎉</Text>
            </View>
          ) : (
            pendingTasks.slice(0, 3).map((task) => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskContent}>
                  <View
                    style={[
                      styles.priorityDot,
                      {
                        backgroundColor:
                          task.priority === 'high'
                            ? '#ef4444'
                            : task.priority === 'medium'
                            ? '#f59e0b'
                            : '#22c55e',
                      },
                    ]}
                  />
                  <View style={styles.taskTextContainer}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.description && (
                      <Text style={styles.taskDescription} numberOfLines={1}>
                        {task.description}
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-back" size={20} color="#9ca3af" />
              </View>
            ))
          )}
        </View>

        {/* Active Habits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>عاداتي النشطة</Text>
            <Text style={styles.sectionCount}>{activeHabits.length}</Text>
          </View>
          
          {activeHabits.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="add-circle-outline" size={48} color="#9ca3af" />
              <Text style={styles.emptyText}>ابدأ بإضافة عادة جديدة!</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.habitsList}>
              {activeHabits.map((habit) => (
                <View key={habit.id} style={[styles.habitCard, { backgroundColor: habit.color + '20' }]}>
                  <Ionicons name={habit.icon as any} size={32} color={habit.color} />
                  <Text style={styles.habitName}>{habit.name}</Text>
                  <View style={styles.streakBadge}>
                    <Ionicons name="flame" size={16} color="#f59e0b" />
                    <Text style={styles.streakText}>{habit.streak} يوم</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipCard: {
    backgroundColor: '#fefce8',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350f',
    marginRight: 8,
  },
  tipText: {
    fontSize: 15,
    color: '#78350f',
    lineHeight: 22,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 12,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
  },
  taskDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'right',
  },
  habitsList: {
    paddingHorizontal: 20,
  },
  habitCard: {
    width: 120,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginLeft: 12,
  },
  habitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 8,
    textAlign: 'center',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 12,
  },
});
