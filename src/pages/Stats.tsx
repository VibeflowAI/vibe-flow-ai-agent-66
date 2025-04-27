
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { useMood } from '@/contexts/MoodContext';
import { ChartContainer } from "@/components/ui/chart";
import { Line, Bar, BarChart, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const Stats = () => {
  const { user } = useAuth();
  const { moodHistory, moodEmojis } = useMood();

  // Process mood data for charts
  const moodData = moodHistory?.map(entry => ({
    date: new Date(entry.timestamp).toLocaleDateString(),
    mood: entry.mood,
    energy: entry.energy === 'high' ? 3 : entry.energy === 'medium' ? 2 : 1
  })) || [];

  // Count mood frequencies
  const moodFrequency = moodHistory?.reduce((acc: any, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {});

  const moodFreqData = Object.entries(moodFrequency || {}).map(([mood, count]) => ({
    mood,
    count
  }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800">Detailed Statistics</h1>
          <p className="text-lg text-gray-600 mt-2">Track your wellness journey with detailed insights</p>
        </motion.header>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Mood Timeline */}
          <motion.div variants={item} className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Mood Timeline</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer
                  config={{
                    energy: { theme: { light: "#9b87f5" } },
                    mood: { theme: { light: "#7E69AB" } }
                  }}
                >
                  <LineChart data={moodData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="energy" name="Energy Level" stroke="var(--color-energy)" />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mood Distribution */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Mood Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer
                  config={{
                    count: { theme: { light: "#6E59A5" } }
                  }}
                >
                  <BarChart data={moodFreqData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" name="Frequency" fill="var(--color-count)" />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Weekly Summary */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <CardTitle>Weekly Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-vibe-primary/10 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Most Common Mood</p>
                      <p className="text-2xl font-semibold text-vibe-primary mt-1">
                        {Object.entries(moodFrequency || {}).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-vibe-primary/10 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Mood Entries</p>
                      <p className="text-2xl font-semibold text-vibe-primary mt-1">
                        {moodHistory?.length || 0}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Recent Progress</h4>
                    <div className="space-y-2">
                      {moodHistory?.slice(0, 3).map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{moodEmojis[entry.mood]}</span>
                            <span className="text-sm text-gray-600">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-vibe-primary capitalize">
                            {entry.energy} energy
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Stats;
