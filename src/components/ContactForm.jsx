import {useState} from 'react';
import LimitedFieldInput from './LimitedFieldInput';
import FieldCharacterCount from './FieldCharacterCount';

const FIELD_LIMITS = {
  firstName: 15,
  lastName: 15,
  email: 20,
  phone: 15,
  message: 15,
};

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
};

export default function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({...prev, [field]: event.target.value}));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="contact-form contact-form--success">
        <h2>Thank you!</h2>
        <p>Your message has been received. (This demo does not send anywhere.)</p>
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => {
            setForm(INITIAL_FORM);
            setSubmitted(false);
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="firstName">First Name</label>
          <LimitedFieldInput
            id="firstName"
            name="firstName"
            type="text"
            autoComplete="given-name"
            required
            value={form.firstName}
            maxLength={FIELD_LIMITS.firstName}
            onChange={handleChange('firstName')}
            placeholder="Jane"
          />
          <FieldCharacterCount
            length={form.firstName.length}
            maxLength={FIELD_LIMITS.firstName}
          />
        </div>

        <div className="form-field">
          <label htmlFor="lastName">Last Name</label>
          <LimitedFieldInput
            id="lastName"
            name="lastName"
            type="text"
            autoComplete="family-name"
            required
            value={form.lastName}
            maxLength={FIELD_LIMITS.lastName}
            onChange={handleChange('lastName')}
            placeholder="Doe"
          />
          <FieldCharacterCount
            length={form.lastName.length}
            maxLength={FIELD_LIMITS.lastName}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="email">Email Address</label>
          <LimitedFieldInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            maxLength={FIELD_LIMITS.email}
            onChange={handleChange('email')}
            placeholder="jane@example.com"
          />
          <FieldCharacterCount
            length={form.email.length}
            maxLength={FIELD_LIMITS.email}
          />
        </div>

        <div className="form-field">
          <label htmlFor="phone">Phone Number</label>
          <LimitedFieldInput
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={form.phone}
            maxLength={FIELD_LIMITS.phone}
            onChange={handleChange('phone')}
            placeholder="(555) 123-4567"
          />
          <FieldCharacterCount
            length={form.phone.length}
            maxLength={FIELD_LIMITS.phone}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="message">Message</label>
        <LimitedFieldInput
          as="textarea"
          id="message"
          name="message"
          rows={2}
          required
          value={form.message}
          maxLength={FIELD_LIMITS.message}
          onChange={handleChange('message')}
          placeholder="How can we help?"
        />
        <FieldCharacterCount
          length={form.message.length}
          maxLength={FIELD_LIMITS.message}
        />
      </div>

      <button type="submit" className="btn btn--primary">
        Send Message
      </button>
    </form>
  );
}
