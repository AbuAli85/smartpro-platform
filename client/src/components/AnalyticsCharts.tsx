import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function BookingTrendsChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Bookings',
        data: [12, 19, 15, 25, 32, 28],
        borderColor: '#003366',
        backgroundColor: 'rgba(0, 51, 102, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Completed',
        data: [10, 17, 14, 22, 28, 25],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Trends</CardTitle>
        <CardDescription>Monthly booking and completion rates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function DocumentGenerationChart() {
  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Documents Generated',
        data: [45, 52, 48, 65, 72, 68],
        backgroundColor: '#003366',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Generation</CardTitle>
        <CardDescription>Monthly document creation patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ServiceDistributionChart() {
  const data = {
    labels: ['Business Registration', 'Document Attestation', 'License Renewal', 'Tax Filing', 'Other'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#003366',
          '#004488',
          '#0066cc',
          '#3399ff',
          '#99ccff',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Distribution</CardTitle>
        <CardDescription>Most requested services</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Doughnut data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}

export function OfficePerformanceChart() {
  const data = {
    labels: ['Muscat Hub', 'Salalah Center', 'Sohar Industrial', 'Nizwa Heritage'],
    datasets: [
      {
        label: 'Bookings',
        data: [85, 72, 68, 45],
        backgroundColor: '#003366',
      },
      {
        label: 'Completion Rate %',
        data: [92, 88, 85, 78],
        backgroundColor: '#10b981',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Office Performance</CardTitle>
        <CardDescription>Bookings and completion rates by office</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
