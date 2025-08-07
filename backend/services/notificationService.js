const knex = require('knex')(require('../knexfile').development);

class NotificationService {
  async sendDailyReminders() {
    try {
      // Get appointments for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const endOfTomorrow = new Date(tomorrow);
      endOfTomorrow.setHours(23, 59, 59, 999);

      const appointments = await knex('appointments')
        .join('users as patients', 'appointments.patient_id', 'patients.id')
        .join('doctors', 'appointments.doctor_id', 'doctors.id')
        .join('users as doctor_users', 'doctors.user_id', 'doctor_users.id')
        .where('appointments.status', 'scheduled')
        .where('appointments.appointment_date', '>=', tomorrow)
        .where('appointments.appointment_date', '<=', endOfTomorrow)
        .select(
          'appointments.*',
          'patients.email as patient_email',
          'patients.first_name as patient_first_name',
          'doctor_users.email as doctor_email',
          'doctor_users.first_name as doctor_first_name'
        );

      // Mock email sending (in real app, use nodemailer)
      appointments.forEach(appointment => {
        console.log(`Email reminder sent to ${appointment.patient_email} for appointment on ${appointment.appointment_date}`);
        console.log(`Email reminder sent to ${appointment.doctor_email} for appointment with ${appointment.patient_first_name}`);
      });

    } catch (error) {
      console.error('Error sending daily reminders:', error);
    }
  }

  async checkLowStockAlerts() {
    try {
      const lowStockSupplies = await knex('supplies')
        .whereRaw('current_stock <= minimum_stock');

      if (lowStockSupplies.length > 0) {
        // Get admin emails
        const admins = await knex('users').where('role', 'admin').select('email');
        
        // Mock email sending
        admins.forEach(admin => {
          console.log(`Low stock alert sent to ${admin.email}`);
          console.log('Low stock items:', lowStockSupplies.map(s => s.name).join(', '));
        });
      }
    } catch (error) {
      console.error('Error checking low stock alerts:', error);
    }
  }

  // Add method to send appointment reminders
  async sendAppointmentReminder(appointmentId) {
    try {
      const appointment = await knex('appointments')
        .join('users as patients', 'appointments.patient_id', 'patients.id')
        .join('doctors', 'appointments.doctor_id', 'doctors.id')
        .join('users as doctor_users', 'doctors.user_id', 'doctor_users.id')
        .where('appointments.id', appointmentId)
        .select(
          'appointments.*',
          'patients.email as patient_email',
          'patients.first_name as patient_first_name',
          'doctor_users.first_name as doctor_first_name',
          'doctor_users.last_name as doctor_last_name'
        )
        .first();

      if (appointment) {
        console.log(`Reminder sent to ${appointment.patient_email} for appointment with Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`);
      }
    } catch (error) {
      console.error('Error sending appointment reminder:', error);
    }
  }

  // Add method to check supply expiry
  async checkExpiringSupplies() {
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const expiringSupplies = await knex('supplies')
        .where('expiry_date', '<=', thirtyDaysFromNow)
        .where('expiry_date', '>', new Date());

      if (expiringSupplies.length > 0) {
        const admins = await knex('users').where('role', 'admin').select('email', 'first_name');
        
        admins.forEach(admin => {
          console.log(`Expiry alert sent to ${admin.email}`);
          console.log('Expiring items:', expiringSupplies.map(s => `${s.name} (${s.expiry_date})`).join(', '));
        });
      }
    } catch (error) {
      console.error('Error checking expiring supplies:', error);
    }
  }

  // Add method to send supply shortage alerts when appointments are blocked
  async sendSupplyShortageAlert(appointmentData, unavailableSupplies) {
    try {
      // Get admin and doctor emails
      const admins = await knex('users').where('role', 'admin').select('email', 'first_name');
      const doctor = await knex('doctors')
        .join('users', 'doctors.user_id', 'users.id')
        .where('doctors.id', appointmentData.doctor_id)
        .select('users.email', 'users.first_name')
        .first();

      // Mock email sending
      admins.forEach(admin => {
        console.log(`🚨 SUPPLY SHORTAGE ALERT sent to ${admin.email}`);
        console.log(`Appointment blocked due to unavailable supplies: ${unavailableSupplies.join(', ')}`);
      });

      if (doctor) {
        console.log(`🚨 SUPPLY SHORTAGE ALERT sent to ${doctor.email}`);
        console.log(`Your upcoming appointments may be affected by supply shortage: ${unavailableSupplies.join(', ')}`);
      }
    } catch (error) {
      console.error('Error sending supply shortage alert:', error);
    }
  }

  // Add method to check upcoming appointments for supply issues
  async checkUpcomingAppointmentSupplies() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const upcomingAppointments = await knex('appointments')
        .where('status', 'scheduled')
        .where('appointment_date', '>=', new Date())
        .where('appointment_date', '<=', tomorrow);

      for (const appointment of upcomingAppointments) {
        if (appointment.required_supplies) {
          const requiredSupplyIds = JSON.parse(appointment.required_supplies);
          const supplies = await knex('supplies').whereIn('id', requiredSupplyIds);
          
          const unavailableSupplies = supplies.filter(supply => supply.current_stock <= 0);
          
          if (unavailableSupplies.length > 0) {
            await this.sendSupplyShortageAlert(appointment, unavailableSupplies.map(s => s.name));
          }
        }
      }
    } catch (error) {
      console.error('Error checking upcoming appointment supplies:', error);
    }
  }
}

module.exports = new NotificationService();
