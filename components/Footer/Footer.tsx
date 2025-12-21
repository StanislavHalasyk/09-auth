import css from './Footer.module.css';

const devName = 'Samir Sharif';

export default function Footer() {
  return (
    <footer className={css.footer}>
      <div className={css.content}>
        <p>© {new Date().getFullYear()} NoteHub. All rights reserved.</p>
        <div className={css.wrap}>
          <p>Developer: Halasyk Stanislav</p>
          <p>
            Contact us:
            <a href="mailto:halasykstanislav@gmail.com"> halasykstanislav@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
