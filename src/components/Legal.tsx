import { motion } from "motion/react";

interface LegalProps {
  lang?: "ru" | "en";
}

export function TermsOfService({ lang = "ru" }: LegalProps) {
  const isEn = lang === "en";
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="py-12 bg-slate-50 dark:bg-slate-900 min-h-screen text-left transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h1 className="font-serif text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
          {isEn ? "Terms of Use" : "ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ - (ПУБЛИЧНАЯ ОФЕРТА)"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">
          Платформы «Ассоциация Моделей Организации Объединенных Наций в Кыргызстане»<br/>
          (Association of Model United Nations Kyrgyzstan — AMUNKG)<br/>
          Дата публикации и вступления в силу: 11.06.2026 г.<br/>
          Редакция: Действующая
        </p>

        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            Настоящий документ в соответствии с нормами Гражданского кодекса Кыргызской Республики представляет собой официальное предложение (публичную оферту) Администрации Платформы AMUNKG (далее — «Администрация») заключить договор об использовании Платформы на изложенных ниже условиях.
          </p>
          <p>
            Регистрация на Платформе, а равно использование ее функционала в любой форме означает полное, безоговорочное и безусловное согласие (акцепт) Пользователя со всеми условиями настоящего Соглашения. В случае несогласия с какими-либо условиями Пользователь обязан немедленно прекратить использование Платформы.
          </p>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">1. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ</h2>
          <ul className="list-none space-y-2">
             <li>1.1. <b>Платформа AMUNKG (Платформа)</b> — программно-аппаратный комплекс, доступный в сети Интернет, включающий в себя веб-сайт, базы данных, программные интерфейсы и функционал, предназначенный для регистрации, управления и информационного сопровождения конференций Model United Nations (MUN), а также для размещения и распространения новостных, аналитических и информационных материалов, освещающих деятельность Ассоциации и Организации Объединенных Наций (ООН) в целом.</li>
             <li>1.2. <b>Администрация</b> — законные правообладатели Платформы и уполномоченные ими лица, осуществляющие управление Платформой, предоставление доступа Пользователям и контроль за соблюдением настоящего Соглашения.</li>
             <li>1.3. <b>Пользователь</b> — физическое лицо, обладающее необходимой право- и дееспособностью, принявшее условия настоящего Соглашения. Пользователь может действовать как независимый участник либо как официальный представитель учебного заведения/делегации.</li>
             <li>1.4. <b>Учетная запись (Аккаунт)</b> — персонализированная рабочая среда Пользователя на Платформе, доступ к которой осуществляется с использованием уникальных учетных данных (логина и пароля).</li>
             <li>1.5. <b>Пользовательский контент</b> — любые информационные материалы, включая тексты, документы, изображения и сообщения, размещаемые Пользователем на Платформе.</li>
             <li>1.6. <b>Мероприятие (Конференция)</b> — симуляция заседаний органов ООН (Model UN) и сопутствующие образовательные события, координация которых осуществляется через Платформу.</li>
             <li>1.7. <b>Раздел новостей</b> — специализированный информационный модуль Платформы, предназначенный для официальной публикации Администрацией новостных, аналитических и просветительских материалов о деятельности Ассоциации, проводимых Конференциях, а также об актуальных событиях, связанных с Организацией Объединенных Наций (ООН).</li>
          </ul>
          
          <h2 className="font-bold text-lg text-slate-900 dark:text-white">2. ПРЕДМЕТ СОГЛАШЕНИЯ</h2>
          <ul className="list-none space-y-2">
             <li>2.1. Администрация предоставляет Пользователю неисключительное, непередаваемое право (простую лицензию) на использование функционала Платформы на условиях «как есть» (As Is) в личных, образовательных и некоммерческих целях.</li>
             <li>2.2. Настоящее Соглашение не влечет за собой отчуждение или передачу Пользователю каких-либо исключительных прав на интеллектуальную собственность Администрации, связанную с Платформой.</li>
             <li>2.3. Использование отдельных модулей или сервисов Платформы может регулироваться локальными правилами конкретных Конференций, которые по умолчанию признаются неотъемлемой частью настоящего Соглашения.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">3. ПОРЯДОК РЕГИСТРАЦИИ И БЕЗОПАСНОСТЬ УЧЕТНОЙ ЗАПИСИ</h2>
          <ul className="list-none space-y-2">
             <li>3.1. Для получения полного доступа к функционалу Платформы Пользователь обязуется пройти процедуру регистрации, предоставив достоверную, актуальную и полную информацию о себе в регистрационной форме.</li>
             <li>3.2. В случае предоставления заведомо ложных сведений или возникновения у Администрации обоснованных сомнений в достоверности данных, Администрация вправе приостановить доступ к Учетной записи или аннулировать ее без предварительного уведомления.</li>
             <li>3.3. Пользователь несет единоличную ответственность за сохранность своих учетных данных и обязуется не передавать логин и пароль третьим лицам.</li>
             <li>3.4. Обо всех случаях несанкционированного доступа к Учетной записи Пользователь обязан незамедлительно уведомить службу технической поддержки Администрации.</li>
             <li>3.5. Администрация не несет ответственности за утрату данных, репутационные или финансовые убытки, возникшие вследствие небрежного отношения Пользователя к безопасности своего Аккаунта.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">4. ПРАВА И ОБЯЗАННОСТИ СТОРОН</h2>
          <h3 className="font-semibold text-slate-900 dark:text-white">4.1. Пользователь вправе:</h3>
          <ul className="list-none space-y-2 mb-4">
             <li>4.1.1. Использовать доступный функционал Платформы для регистрации на Мероприятия, подачи документов, формирования Конференций и управления ими.</li>
             <li>4.1.2. Обращаться в службу поддержки Администрации за разъяснениями по вопросам работы Платформы.</li>
          </ul>
          <h3 className="font-semibold text-slate-900 dark:text-white">4.2. Пользователь обязан:</h3>
          <ul className="list-none space-y-2">
             <li>4.2.1. Строго соблюдать нормы законодательства Кыргызской Республики, условия данного Соглашения и общепризнанные принципы академической этики.</li>
             <li>4.2.2. Проявлять уважение к другим Пользователям, Организаторам и Администрации, строго соблюдая дипломатический протокол общения.</li>
             <li>4.2.3. Своевременно и в полном объеме производить оплату регистрационных взносов, если таковые предусмотрены регламентом конкретного Мероприятия.</li>
             <li>4.2.4. Воздерживаться от любых действий, направленных на дестабилизацию работы Платформы, попыток несанкционированного доступа к базам данных и исходному коду.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">5. ИНТЕЛЛЕКТУАЛЬНАЯ СОБСТВЕННОСТЬ И КОНТЕНТ</h2>
          <ul className="list-none space-y-2">
             <li>5.1. Все элементы дизайна, текст, графические изображения, программный код, базы данных и логотипы, размещенные на Платформе, являются объектами исключительных авторских прав Администрации и охраняются законом.</li>
             <li>5.2. Размещая Пользовательский контент на Платформе, Пользователь безвозмездно предоставляет Администрации простую (неисключительную) лицензию на его хранение, воспроизведение, адаптацию, техническую обработку и публичное отображение в рамках функционирования Платформы. Пользователь гарантирует, что размещаемый контент не нарушает авторских прав третьих лиц.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">6. КОНФИДЕНЦИАЛЬНОСТЬ И ОБРАБОТКА ПЕРСОНАЛЬНЫХ ДАННЫХ</h2>
          <ul className="list-none space-y-2">
             <li>6.1. Акцептуя настоящую Оферту, Пользователь дает Администрации свое информированное и добровольное согласие на сбор, хранение, обработку и использование своих персональных данных (согласно Закону КР «Об информации персонального характера»).</li>
             <li>6.2. Обработка данных осуществляется исключительно в целях надлежащего исполнения настоящего Соглашения: идентификации Пользователя, обеспечения участия в Мероприятиях, создание Конференций, обратной связи и осуществления финансовых расчетов (возвратов).</li>
             <li>6.3. Администрация принимает все необходимые и достаточные правовые, организационные и технические меры для защиты персональных данных Пользователя от неправомерного доступа, уничтожения или изменения.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">7. ПЛАТНЫЕ УСЛУГИ, РЕГИСТРАЦИОННЫЕ ВЗНОСЫ И ПОЛИТИКА ВОЗВРАТА</h2>
          <ul className="list-none space-y-2">
             <li>7.1. Регистрационные взносы. Участие в Мероприятиях может требовать уплаты организационного взноса (Delegate Fee, Delegation Fee и т.д.). Размер взноса, сроки, валюта и способы оплаты устанавливаются исключительно независимым Организационным комитетом конкретного Мероприятия и публикуются на Платформе.</li>
             <li>7.2. Порядок расчетов и ограничение ответственности Платформы.
               <ul className="list-none pl-5 mt-1 space-y-1">
                 <li>7.2.1. Прямые расчеты. Администрация и Платформа предоставляют исключительно информационную площадку. Все финансовые взаимоотношения, включая оплату регистрационных взносов за участие в Конференциях, осуществляются напрямую между двумя лицами: Пользователем (Участником) и Организатором Мероприятия.</li>
                 <li>7.2.2. Отказ от ответственности. Платформа и ее Администрация не принимают денежные средства Пользователей на свои расчетные счета, не выступают стороной сделки, не являются налоговым агентом и не несут никакой юридической или финансовой ответственности за процесс транзакций, непредоставление услуг Организатором, успешность проведения платежей, возвраты средств, а также за любые возможные финансовые споры, возникающие между Пользователем и Организатором.</li>
                 <li>7.2.3. Оплата осуществляется способами, которые предоставляет непосредственно Организатор (через сторонние платежные шлюзы, интернет-эквайринг банков-партнеров или прямые переводы). Платформа не осуществляет сбор, обработку и хранение полных реквизитов банковских карт Пользователя.</li>
                 <li>7.2.4. Обязательства Пользователя по оплате взноса считаются исполненными в момент фактического поступления денежных средств на расчетный счет (или электронный кошелек) Организатора Мероприятия.</li>
               </ul>
             </li>
             <li>7.3. Политика возврата средств (Refund Policy). Поскольку Платформа не является получателем платежей, все требования о возврате средств направляются Пользователем напрямую Организатору. Если на странице конкретной Конференции Организатором не установлен иной регламент, действуют следующие базовые правила возврата, исполнение которых лежит на Организаторе:
               <ul className="list-none pl-5 mt-1 space-y-1">
                 <li>7.3.1. Возврат 100% осуществляется исключительно в случае официальной отмены Мероприятия по инициативе Организатора.</li>
                 <li>7.3.2. В случае добровольного отказа Пользователя от участия:
                   <ul className="list-disc pl-5 mt-1 space-y-1">
                     <li>При подаче письменного заявления Организатору за 30 и более календарных дней до Конференции — возврат 100% (за вычетом фактических банковских комиссий за перевод).</li>
                     <li>При подаче заявления в срок от 29 до 14 календарных дней до Конференции — возврат 50% от суммы взноса.</li>
                     <li>При подаче заявления менее чем за 14 календарных дней — возврат не осуществляется. Сумма удерживается в счет компенсации фактически понесенных Организатором расходов на подготовку (бронирование площадок, печать материалов и др.).</li>
                   </ul>
                 </li>
                 <li>7.3.3. Возврат не производится ни при каких условиях в случаях: неявки Пользователя (No-show); дисквалификации или удаления Пользователя с Мероприятия за нарушение дипломатического протокола, этики или правил Соглашения.</li>
               </ul>
             </li>
             <li>7.4. Процедура возврата. Процедура возврата инициируется на основании заявления, направленного Пользователем по контактным данным Организатора Конференции. Сроки рассмотрения заявления и зачисления средств зависят от регламента Организатора и банка-эмитента карты Пользователя, и не контролируются Администрацией Платформы.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">8. ПРАВА И ПОЛНОМОЧИЯ АДМИНИСТРАЦИИ (МОДЕРАЦИЯ)</h2>
          <ul className="list-none space-y-2">
             <li>8.1. Администрация обладает абсолютным дискреционным правом (правом действовать по собственному усмотрению) и в целях защиты интересов Платформы вправе без предварительного объяснения причин:
               <ul className="list-none pl-5 mt-1 space-y-1">
                 <li>8.1.1. Временно блокировать или бессрочно удалять Учетную запись Пользователя при выявлении нарушений (или обоснованном подозрении в нарушении) условий Соглашения.</li>
                 <li>8.1.2. Ограничивать доступ Пользователя к отдельным модулям или функционалу.</li>
                 <li>8.1.3. Модерировать, редактировать или удалять любой Пользовательский контент, нарушающий законодательство, правила Платформы или содержащий плагиат.</li>
                 <li>8.1.4. Аннулировать регистрацию Пользователя на конкретную Конференцию без права на возврат взноса в случае грубого или систематического нарушения правил.</li>
                 <li>8.1.5. Проводить аудит безопасности: действия Пользователей фиксируются во внутренних системных журналах (логах) Платформы.</li>
                 <li>8.1.6. Модифицировать Платформу: изменять ее дизайн, алгоритмы работы, функционал и интерфейс без предварительного уведомления и согласования с Пользователями.</li>
               </ul>
             </li>
             <li>8.2. Администрация вправе приостанавливать работу Платформы для проведения плановых или экстренных технических и профилактических работ.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">9. ПРЕКРАЩЕНИЕ ДЕЙСТВИЯ СОГЛАШЕНИЯ (УДАЛЕНИЕ АККАУНТА)</h2>
          <ul className="list-none space-y-2">
             <li>9.1. Соглашение действует бессрочно, вплоть до момента удаления Учетной записи.</li>
             <li>9.2. Пользователь имеет право в любой момент расторгнуть Соглашение, инициировав удаление своей Учетной записи через настройки Платформы.</li>
             <li>9.3. При удалении аккаунта персональные данные Пользователя стираются из операционной базы данных. Исключение составляют системные журналы, деперсонализированная статистика и финансовая документация, которые Администрация обязана хранить в течение срока, установленного законодательством КР (в целях налогового учета и информационной безопасности).</li>
             <li>9.4. Удаление Учетной записи носит необратимый характер. Восстановление накопленных данных, истории участия после удаления технически невозможно.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">10. ОГРАНИЧЕНИЕ ОТВЕТСТВЕННОСТИ (DISCLAIMER) И ФОРС-МАЖОР</h2>
          <ul className="list-none space-y-2">
             <li>10.1. Платформа предоставляется на условиях «как есть» (As Is). Администрация прямо отказывается от любых гарантий того, что Платформа будет соответствовать субъективным требованиям или ожиданиям Пользователя, а также работать бесперебойно и безошибочно.</li>
             <li>10.2. Администрация не несет юридической и материальной ответственности за:
               <ul className="list-disc pl-5 mt-1 space-y-1">
                 <li>Любые прямые или косвенные убытки, включая упущенную выгоду, возникшие в связи с использованием или невозможностью использования Платформы;</li>
                 <li>Действия, высказывания и поведение других Пользователей или третьих лиц;</li>
                 <li>Достоверность информации, размещаемой независимыми Организаторами Конференций;</li>
                 <li>Технические сбои, возникшие по вине дата-центров, интернет-провайдеров, платежных систем или в результате кибератак и воздействия вредоносного ПО.</li>
               </ul>
             </li>
             <li>10.3. <b>Форс-мажор.</b> Стороны освобождаются от ответственности за частичное или полное неисполнение обязательств по настоящему Соглашению, если оно стало следствием обстоятельств непреодолимой силы (пожар, наводнение, землетрясение, военные действия, эпидемии, акты государственных органов, глобальные отключения или сбои в сети Интернет и тд), возникших после акцепта настоящей Оферты.</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">11. ПОРЯДОК РАЗРЕШЕНИЯ СПОРОВ И ИЕРАРХИЯ ПРИНЯТИЯ РЕШЕНИЙ</h2>
          <ul className="list-none space-y-2">
             <li>11.1. <b>Обязательный досудебный порядок.</b> В случае возникновения любых споров, претензий или разногласий, связанных с использованием Платформы, финансовыми расчетами, модерацией или блокировкой, Пользователь обязан направить официальную письменную претензию в Администрацию. Срок ответа на претензию составляет до 30 (тридцати) календарных дней.</li>
             <li>11.2. <b>Первичное урегулирование.</b> Правом рассмотрения жалоб и вынесения первичного решения обладает Администрация Платформы или профильный Организационный комитет.</li>
             <li>11.3. <b>Высшая инстанция (Исключительное право Основателя).</b> Внутренняя экосистема Платформы строится на принципе суверенитета ее создателя. В случае несогласия Пользователя с первичным решением, исключительным правом финального рассмотрения конфликтной ситуации обладает Основатель (Учредитель) Платформы.</li>
             <li>11.4. <b>Окончательность решений.</b> Решение, вынесенное Основателем Платформы в рамках досудебного (внутреннего) урегулирования, признается абсолютным и окончательным для Сторон. Оно вступает в силу немедленно и не подлежит дальнейшему внутреннему обсуждению или апелляции. Пользователь добровольно соглашается с тем, что слово Основателя является высшим авторитетом во внутренних спорах AMUNKG.</li>
          </ul>

        </div>
      </div>
    </motion.div>
  );
}

export function PrivacyPolicy({ lang = "ru" }: LegalProps) {
  const isEn = lang === "en";
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="py-12 bg-slate-50 dark:bg-slate-900 min-h-screen text-left transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
        <h1 className="font-serif text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
          {isEn ? "PRIVACY AND PERSONAL DATA PROCESSING POLICY" : "ПОЛИТИКА КОНФИДЕНЦИАЛЬНОСТИ И ОБРАБОТКИ ПЕРСОНАЛЬНЫХ ДАННЫХ"}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">
          {isEn ? 'Platforms "Association of Model United Nations Kyrgyzstan" (AMUNKG)' : 'Платформы «Ассоциация Моделей Организации Объединенных Наций в Кыргызстане» (Association of Model United Nations Kyrgyzstan — AMUNKG)'}<br/>
          {isEn ? 'Date of publication and effective date: 11.06.2026' : 'Дата публикации и вступления в силу: 11.06.2026 г.'}<br/>
          {isEn ? 'Edition: Current' : 'Редакция: Действующая'}
        </p>
        <div className="space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <p>
            {isEn 
             ? "This Privacy Policy (hereinafter the \"Policy\") is an integral part of the AMUNKG Platform User Agreement. The document defines the exhaustive procedure for the collection, storage, transfer, and other types of processing of Users' personal data, as well as information about the implemented requirements for their protection. The Policy is developed in accordance with the Law of the Kyrgyz Republic \"On Personal Information\" and takes into account advanced international practices (including GDPR principles). By using the Platform, the User expresses their full, informed, and unconditional consent to all the terms of this Document." 
             : "Настоящая Политика конфиденциальности (далее — «Политика») является неотъемлемой частью Пользовательского соглашения Платформы AMUNKG. Документ определяет исчерпывающий порядок сбора, хранения, передачи и иных видов обработки персональных данных Пользователей, а также сведения о реализуемых требованиях к их защите. Политика разработана в соответствии с Законом Кыргызской Республики «Об информации персонального характера» и учитывает передовые международные практики (включая принципы GDPR). Используя Платформу, Пользователь выражает свое полное, информированное и безоговорочное согласие со всеми условиями настоящего Документа."}
          </p>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "1. EXHAUSTIVE LIST OF COLLECTED DATA" : "1. ИСЧЕРПЫВАЮЩИЙ ПЕРЕЧЕНЬ СОБИРАЕМЫХ ДАННЫХ"}</h2>
          <p>{isEn ? "The Platform collects data solely to the extent objectively necessary to provide its functionality. Data is divided into the following categories:" : "Платформа осуществляет сбор данных исключительно в объемах, объективно необходимых для предоставления ее функционала. Данные делятся на следующие категории:"}</p>
          <ul className="list-none space-y-2">
             <li><b>1.1. {isEn ? "Account Data:" : "Базовые учетные данные (Account Data):"}</b>
               <ul className="list-disc pl-5 mt-1">
                 <li>{isEn ? "Last Name, First Name, Patronymic (if any);" : "Фамилия, Имя, Отчество (при наличии);"}</li>
                 <li>{isEn ? "Email address used as a login;" : "Адрес электронной почты (e-mail), используемый в качестве логина;"}</li>
                 <li>{isEn ? "Contact phone number (including linked messenger codes);" : "Контактный номер телефона (включая коды привязанных мессенджеров);"}</li>
                 <li>{isEn ? "Encrypted password hash (The Platform and Administration do not have access to your original password in plain text)." : "Зашифрованный хэш пароля (Платформа и Администрация не имеют доступа к вашему исходному паролю в открытом виде)."}</li>
               </ul>
             </li>
             <li><b>1.2. {isEn ? "Profile Data:" : "Профильные и демографические данные (Profile Data):"}</b>
               <ul className="list-disc pl-5 mt-1">
                 <li>{isEn ? "Date of birth and age category (for compliance with age restrictions);" : "Дата рождения и возрастная категория (для соблюдения возрастных цензов);"}</li>
                 <li>{isEn ? "Citizenship or country of permanent residence." : "Гражданство или страна постоянного проживания."}</li>
               </ul>
             </li>
             <li><b>1.3. {isEn ? "Academic Data:" : "Образовательные и академические данные (Academic Data):"}</b>
               <ul className="list-disc pl-5 mt-1">
                 <li>{isEn ? "Name of educational institution (school, lyceum, gymnasium, university);" : "Наименование учебного заведения (школа, лицей, гимназия, вуз);"}</li>
                 <li>{isEn ? "Faculty, specialty, current grade or year;" : "Факультет, специальность, текущий курс или класс;"}</li>
                 <li>{isEn ? "Information about the level of proficiency in foreign languages (English, Russian, etc.);" : "Сведения об уровне владения иностранными языками (английский, русский и др.);"}</li>
                 <li>{isEn ? "Experience in previous Model UN conferences (quantity, awards received, chairing experience)." : "Опыт участия в предыдущих конференциях Model UN (количество, полученные награды, опыт председательства)."}</li>
               </ul>
             </li>
             <li><b>1.4. {isEn ? "Transaction & Event Data:" : "Данные о транзакциях и участии (Transaction & Event Data):"}</b>
               <ul className="list-disc pl-5 mt-1">
                 <li>{isEn ? "History of applications submitted for Events;" : "История поданных заявок на Мероприятия"}</li>
                 <li>{isEn ? "Payment statuses of registration fees (receipt numbers, transaction dates)." : "Статусы оплаты регистрационных взносов (номера квитанций, даты транзакций)."}</li>
               </ul>
               <span className="font-bold mt-1 block">{isEn ? "ATTENTION:" : "ВНИМАНИЕ:"}</span> {isEn ? "In accordance with the User Agreement, the Platform is not a party to financial settlements between the Participant and the Organizer, and never collects, processes, or stores CVV/CVC codes, PINs, and full bank card numbers of Users." : "В соответствии с Пользовательским соглашением, Платформа не является стороной финансовых расчетов между Участником и Организатором, а также никогда не собирает, не обрабатывает и не хранит CVV/CVC-коды, пин-коды и полные номера банковских карт Пользователей."}
             </li>
             <li><b>1.5. {isEn ? "Technical & Device Data:" : "Технические данные и данные об устройствах (Technical & Device Data):"}</b>
               <ul className="list-disc pl-5 mt-1">
                 <li>{isEn ? "IP addresses and approximate location data (at the city/country level);" : "IP-адреса и данные о приблизительном местоположении (на уровне города/страны);"}</li>
                 <li>{isEn ? "Device type (mobile phone, tablet, PC), model and unique device identifiers (Device ID);" : "Тип устройства (мобильный телефон, планшет, ПК), модель и уникальные идентификаторы устройства (Device ID);"}</li>
                 <li>{isEn ? "Browser type, version, and language;" : "Тип, версия и язык браузера;"}</li>
                 <li>{isEn ? "Operating system data and current time zone." : "Данные операционной системы и текущий часовой пояс."}</li>
               </ul>
             </li>
             <li><b>1.6. {isEn ? "Behavioral Data:" : "Поведенческие данные и системные журналы (Behavioral Data):"}</b>
               <ul className="list-disc pl-5 mt-1">
                 <li>{isEn ? "Exact time of registration, logins, and logouts from the Account;" : "Точное время регистрации, авторизаций и выхода из Учетной записи;"}</li>
                 <li>{isEn ? "Activity logs: interface clicks, page views, time spent on the Platform;" : "Журналы активности (логи): нажатия на элементы интерфейса, просмотры страниц, время, проведенное на Платформе;"}</li>
                 <li>{isEn ? "Technical support requests (full content of correspondence and attachments)." : "Запросы в службу технической поддержки (полное содержание переписки и вложений)."}</li>
               </ul>
             </li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "2. LEGAL GROUNDS AND PURPOSES OF PROCESSING" : "2. ПРАВОВЫЕ ОСНОВАНИЯ И ЦЕЛИ ОБРАБОТКИ"}</h2>
          <p>{isEn ? "Personal data processing is carried out strictly on legal grounds to achieve the following purposes:" : "Обработка персональных данных осуществляется строго на законных основаниях для достижения следующих целей:"}</p>
          <ul className="list-none space-y-2">
             <li><b>2.1. {isEn ? "Execution of the User Agreement:" : "Исполнение Пользовательского соглашения:"}</b> {isEn ? "Creating an Account, authorization, ensuring unhindered access to Platform tools, User verification, and processing applications for Events." : "Создание Учетной записи, авторизация, обеспечение беспрепятственного доступа к инструментам Платформы, верификация Пользователя и обработка заявок на Мероприятия."}</li>
             <li><b>2.2. {isEn ? "Legitimate Interests of the Administration:" : "Законные интересы Администрации:"}</b> {isEn ? "Fraud prevention, IT infrastructure protection against cyberattacks (DDoS), spam detection, and analyzing service usage to improve the design and internal logic of the Platform." : "Предотвращение мошенничества, защита ИТ-инфраструктуры от кибератак (DDoS), выявление спама, а также анализ использования сервиса для улучшения дизайна и внутренней логики Платформы."}</li>
             <li><b>2.3. {isEn ? "Fulfillment of Legal Obligations:" : "Выполнение юридических обязательств:"}</b> {isEn ? "Storing system logs and transaction confirmation information for periods established by KR legislation for tax accounting, auditing, and information security purposes." : "Хранение системных логов и информации о подтверждении транзакций в течение сроков, установленных законодательством КР для целей налогового учета, аудита и информационной безопасности."}</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "3. ACCESS STRUCTURE, TRANSFER, AND DISCLOSURE OF DATA" : "3. СТРУКТУРА ДОСТУПА, ПЕРЕДАЧА И РАСКРЫТИЕ ДАННЫХ"}</h2>
          <p>{isEn ? "The Administration guarantees that personal data is never sold or transferred to data brokers or advertising networks. Data transfer is strictly limited to the following scope:" : "Администрация гарантирует, что персональные данные никогда не продаются и не передаются дата-брокерам или рекламным сетям. Передача данных строго ограничена следующими рамками:"}</p>
          <ul className="list-none space-y-2">
             <li><b>3.1. {isEn ? "Access Hierarchy within the Platform:" : "Иерархия доступа внутри Платформы:"}</b>
               <ul className="list-disc pl-5 mt-1">
                 <li><b>{isEn ? "Line Administration and Moderators:" : "Линейная Администрация и Модераторы:"}</b> {isEn ? "Have strictly limited, role-based access to User data solely for performing technical tasks (content moderation, processing support tickets)." : "Имеют строго ограниченный, ролевой доступ к данным Пользователей исключительно для выполнения технических задач (модерация контента, обработка тикетов поддержки)."}</li>
                 <li><b>{isEn ? "Highest Administration (Founder/Creator of the Platform):" : "Высшая Администрация (Основатель/Учредитель Платформы):"}</b> {isEn ? "Possesses absolute, unlimited, and full access rights to all database segments, system logs, transaction history, and User profiles. The Highest Administration's access is determined by the sovereignty principle of the Platform creator and is necessary for conducting global security audits, investigating internal conflicts, and making final decisions in accordance with section 11 of the User Agreement." : "Обладает абсолютным, неограниченным и полным правом доступа ко всем сегментам базы данных, системным логам, истории транзакций и профилям Пользователей. Доступ Высшей Администрации обусловлен принципом суверенитета создателя Платформы и необходим для проведения глобальных аудитов безопасности, расследования внутренних конфликтов и вынесения окончательных решений согласно разделу 11 Пользовательского соглашения."}</li>
               </ul>
             </li>
             <li><b>3.2. {isEn ? "Transfer to Independent Conference Organizers:" : "Передача Независимым Организаторам Конференций:"}</b> {isEn ? "When applying for a specific Event, the User voluntarily consents to the transfer of their profile and academic data (clauses 1.1–1.3) to the Organizing Committee of this event. The data is transferred solely for selection, country allocation, communication, and printing official materials (badges, certificates)." : "При подаче заявки на конкретное Мероприятие Пользователь добровольно соглашается на передачу своих профильных и академических данных (п. 1.1–1.3) Организационному комитету этого события. Данные передаются исключительно для отбора, распределения стран, коммуникации и печати официальных материалов (бейджей, сертификатов)."}</li>
             <li><b>3.3. {isEn ? "Technical Contractors (Data Processors):" : "Технические подрядчики (Data Processors):"}</b> {isEn ? "To ensure site operation, data may be processed by: cloud hosting providers (database storage), email newsletter services (system emails), and web analytics systems (Yandex.Metrica, Google Analytics in anonymized form)." : "Для обеспечения работы сайта данные могут обрабатывать: провайдеры облачного хостинга (хранение баз данных), сервисы email-рассылок (системные письма) и системы веб-аналитики (Яндекс.Метрика, Google Analytics в обезличенном виде)."}</li>
             <li><b>3.4. {isEn ? "Disclosure by Law:" : "Раскрытие по требованию закона:"}</b> {isEn ? "Data may be provided to government bodies of the Kyrgyz Republic (court, prosecutor's office, law enforcement agencies) solely upon official, legally justified request in accordance with KR legislation." : "Данные могут быть предоставлены государственным органам Кыргызской Республики (суд, прокуратура, правоохранительные органы) исключительно по официальному, юридически обоснованному запросу в соответствии с законодательством КР."}</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "4. CROSS-BORDER TRANSFER AND STORAGE" : "4. ТРАНСГРАНИЧНАЯ ПЕРЕДАЧА И ХРАНЕНИЕ"}</h2>
          <ul className="list-none space-y-2">
             <li><b>4.1. {isEn ? "Server Localization:" : "Локализация серверов:"}</b> {isEn ? "The Platform and its backups may be hosted on highly reliable cloud servers physically located outside the Kyrgyz Republic (in secure international data centers)." : "Платформа и ее бэкапы могут размещаться на высоконадежных облачных серверах, физически расположенных за пределами Кыргызской Республики (в защищенных международных дата-центрах)."}</li>
             <li><b>4.2. {isEn ? "Protection Guarantees:" : "Гарантии защиты:"}</b> {isEn ? "When carrying out cross-border transfers, the Administration ensures that the receiving party provides an adequate level of cryptographic and physical data control." : "Осуществляя трансграничную передачу, Администрация убеждается, что принимающая сторона обеспечивает адекватный уровень криптографического и физического контроля данных."}</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "5. RETENTION PERIODS AND BACKUP MANAGEMENT" : "5. СРОКИ ХРАНЕНИЯ И РАБОТА С РЕЗЕРВНЫМИ КОПИЯМИ"}</h2>
          <ul className="list-none space-y-2">
             <li><b>5.1. {isEn ? "Active Accounts:" : "Активные Аккаунты:"}</b> {isEn ? "Data is stored indefinitely throughout the active period of the User's Account." : "Данные хранятся бессрочно в течение всего периода активности Учетной записи Пользователя."}</li>
             <li><b>5.2. {isEn ? "Deleted Accounts:" : "Удаленные Аккаунты:"}</b> {isEn ? "Upon initiating Account deletion, profile data is erased from the operational database within 72 hours." : "При инициировании удаления Аккаунта профильные данные стираются из операционной базы данных в течение 72 часов."}</li>
             <li><b>5.3. {isEn ? "Exceptions (Logs and Backups):" : "Исключения (Логи и бэкапы):"}</b> {isEn ? "In accordance with clause 9.3 of the User Agreement, system logs, depersonalized statistics, and financial documentation are not deleted immediately and are kept by the Administration for the period established by KR law. In addition, deleted data may be retained in isolated encrypted system backups for up to 90 days before completing an automated overwrite." : "В соответствии с п. 9.3 Пользовательского соглашения, системные журналы (логи), деперсонализированная статистика и финансовая документация не удаляются сразу и хранятся Администрацией в течение установленного законом КР срока. Кроме того, удаленные данные могут сохраняться в изолированных зашифрованных резервных копиях (backups) системы на срок до 90 дней до их полной автоматической перезаписи."}</li>
             <li><b>5.4. {isEn ? "Archiving:" : "Архивирование:"}</b> {isEn ? "Data integrated into the official history of past Conferences (final delegates lists, etc.) is stored indefinitely without the right of deletion, as part of the immutable history of the Association." : "Данные, интегрированные в официальную историю прошедших Конференций (финальные списки делегатов и тд), хранятся бессрочно без права удаления, как часть несменяемой истории Ассоциации."}</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "6. COOKIE AND TRACKER POLICY" : "6. ПОЛИТИКА ИСПОЛЬЗОВАНИЯ COOKIE И ТРЕКЕРОВ"}</h2>
          <p>{isEn ? "The Platform uses cookies to ensure basic functionality:" : "Платформа использует файлы cookie для обеспечения базовой работоспособности:"}</p>
          <ul className="list-disc pl-5 space-y-1">
             <li><b>{isEn ? "Essential:" : "Строго необходимые (Essential):"}</b> {isEn ? "To maintain the authorization session and protect against CSRF attacks. Without them, working in the personal cabinet is technically impossible." : "Для поддержания сессии авторизации и защиты от CSRF-атак. Без них работа в личном кабинете технически невозможна."}</li>
             <li><b>{isEn ? "Functional:" : "Функциональные (Functional):"}</b> {isEn ? "To remember language choice, time zone, and visual settings." : "Для запоминания выбора языка, часового пояса и визуальных настроек."}</li>
             <li><b>{isEn ? "Analytical:" : "Аналитические (Analytical):"}</b> {isEn ? "To collect aggregated attendance data to optimize the interface." : "Для сбора агрегированных данных о посещаемости с целью оптимизации интерфейса."}</li>
          </ul>
          <p>{isEn ? "The User can disable cookies in the browser, but the Administration in this case does not guarantee the correct operation of the site's functionality." : "Пользователь может отключить cookie в браузере, но Администрация в таком случае не гарантирует корректную работу функционала сайта."}</p>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "7. SECURITY AND LIMITATION OF LIABILITY (DISCLAIMER OF 100% GUARANTEES)" : "7. БЕЗОПАСНОСТЬ И ОГРАНИЧЕНИЕ ОТВЕТСТВЕННОСТИ (ОТКАЗ ОТ 100% ГАРАНТИЙ)"}</h2>
          <p>{isEn ? "The Administration utilizes a range of measures to protect data (HTTPS/TLS encryption, bcrypt password hashing, role-based access). However, the User must understand and accept the following conditions:" : "Администрация применяет комплекс мер для защиты данных (шифрование HTTPS/TLS, хеширование паролей алгоритмом bcrypt, разграничение ролей доступа). Однако Пользователь должен осознавать и принимать следующие условия:"}</p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 border-l-4 border-[#1a365d] dark:border-[#80add0] my-4 text-xs">
             <span className="font-bold block mb-2">{isEn ? "SECURITY AND STABILITY DISCLAIMER:" : "ДИСКЛЕЙМЕР БЕЗОПАСНОСТИ И СТАБИЛЬНОСТИ:"}</span>
             <p className="mb-2">{isEn ? "The Platform and all its functionalities are provided \"AS IS\". The Administration does not guarantee and is not responsible for the Platform operating 100% uninterrupted, entirely free from errors, technical failures, or downtime." : "Платформа и весь её функционал предоставляются на условиях «КАК ЕСТЬ» (As Is). Администрация не гарантирует и не несет ответственности за то, что Платформа будет работать на 100% бесперебойно, абсолютно без ошибок, технических сбоев или простоев."}</p>
             <p>{isEn ? "No system for transferring data over the Internet or method of electronic storage can be 100% secure. The Administration does not guarantee absolute invulnerability to targeted hacker attacks, intentional malware, or force majeure circumstances. The User is fully responsible for the strength of their password and the security of their personal devices." : "Ни одна система передачи данных через сеть Интернет или метод электронного хранения не могут быть защищены на абсолютные 100%. Администрация не гарантирует абсолютную неуязвимость перед целевыми хакерскими атаками, умышленным вредоносным ПО или форс-мажорными обстоятельствами. Пользователь самостоятельно несет полную ответственность за надежность своего пароля и безопасность своих персональных устройств."}</p>
          </div>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "8. EXHAUSTIVE USER RIGHTS" : "8. ИСЧЕРПЫВАЮЩИЕ ПРАВА ПОЛЬЗОВАТЕЛЯ"}</h2>
          <p>{isEn ? "Within the framework of transparency, the User has the right to:" : "В рамках прозрачности Пользователь имеет право на:"}</p>
          <ul className="list-none space-y-2">
             <li><b>8.1. {isEn ? "Access:" : "Доступ:"}</b> {isEn ? "Request information about the list of their data stored on the servers." : "Запрос информации о перечне его данных, хранящихся на серверах."}</li>
             <li><b>8.2. {isEn ? "Update:" : "Актуализацию:"}</b> {isEn ? "Independently correct inaccurate data in the personal cabinet." : "Самостоятельное исправление неточных данных в личном кабинете."}</li>
             <li><b>8.3. {isEn ? "Right to be Forgotten (Deletion):" : "Забвение (Удаление):"}</b> {isEn ? "Submit a request to delete their Account through the Platform settings." : "Подачу запроса на удаление своего Аккаунта через настройки Платформы."}</li>
             <li><b>8.4. {isEn ? "Restriction of Processing:" : "Ограничение обработки:"}</b> {isEn ? "Freeze the use of data during the resolution of internal disputes." : "Заморозку использования данных на период разрешения внутренних споров."}</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "9. PROTECTION OF MINORS' DATA" : "9. ЗАЩИТА ДАННЫХ НЕСОВЕРШЕННОЛЕТНИХ"}</h2>
          <ul className="list-none space-y-2">
             <li><b>9.1.</b> {isEn ? "Given the specifics of MUN conferences, the Platform allows high school students to participate, but intentionally does not collect data from children under 14 without parental knowledge." : "Учитывая специфику конференций MUN, Платформа допускает участие старшеклассников, но умышленно не собирает данные детей младше 14 лет без ведома родителей."}</li>
             <li><b>9.2.</b> {isEn ? "Registration of Users who have not reached the age of full legal capacity must be carried out strictly under the control, knowledge, and consent of their parents or legal guardians." : "Регистрация Пользователей, не достигших возраста полной дееспособности, должна осуществляться строго под контролем, с ведома и согласия их родителей или законных опекунов."}</li>
             <li><b>9.3.</b> {isEn ? "If the Highest Administration becomes aware that a minor's data was provided without guardian consent, such account is subject to immediate deletion." : "Если Высшей Администрации станет известно, что данные несовершеннолетнего были предоставлены без согласия опекунов, такой аккаунт подлежит незамедлительному удалению."}</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "10. AUTOMATED DECISION MAKING" : "10. АВТОМАТИЗИРОВАННОЕ ПРИНЯТИЕ РЕШЕНИЙ"}</h2>
          <p>{isEn ? "The Platform excludes the use of fully automatic algorithms or AI to make legally significant decisions (e.g., issuing registration refusals). All key decisions (account verification, application approval, Conference selection) are made exclusively by real people — the Highest Administration or authorized members of Organizing Committees." : "Платформа исключает использование полностью автоматических алгоритмов или ИИ для принятия юридически значимых решений (например, вынесение отказов в регистрации). Все ключевые решения (верификация аккаунтов, одобрение заявок, отбор на Конференции) принимаются исключительно реальными людьми — Высшей Администрацией либо уполномоченными членами Организационных комитетов."}</p>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "11. INCIDENT (BREACH) NOTIFICATION PROCEDURE" : "11. ПОРЯДОК УВЕДОМЛЕНИЯ ОБ ИНЦИДЕНТАХ (УТЕЧКАХ)"}</h2>
          <p>{isEn ? "In the event of large-scale unauthorized access to databases (personal information compromise), the Administration undertakes to:" : "В случае масштабного несанкционированного доступа к базам данных (компрометации персональной информации), Администрация обязуется:"}</p>
          <ul className="list-disc pl-5 space-y-1">
             <li>{isEn ? "Take emergency technical measures to localize the threat and close the vulnerability within 24 hours from discovery;" : "В течение 24 часов с момента обнаружения принять экстренные технические меры по локализации угрозы и закрытию уязвимости;"}</li>
             <li>{isEn ? "Notify affected Users within 72 hours, specifying the nature of the incident and clear recommendations for protecting data (such as a mandatory password reset)." : "В течение 72 часов уведомить затронутых Пользователей, указав характер инцидента и четкие рекомендации по защите данных (например, обязательный сброс паролей)."}</li>
          </ul>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "12. AMENDMENTS TO THE POLICY" : "12. ВНЕСЕНИЕ ИЗМЕНЕНИЙ В ПОЛИТИКУ"}</h2>
          <p>{isEn ? "The Highest Administration reserves the absolute discretionary right to change, amend, or rewrite this Policy at any time without prior agreement with the Users. The new edition takes effect from the moment of its publication. Your continued use of the Platform after updating the document is recognized as your full and automatic consent to the new terms of data processing." : "Высшая Администрация оставляет за собой абсолютное дискреционное право изменять, дополнять или переписывать настоящую Политику в любое время без предварительного согласования с Пользователями. Новая редакция вступает в силу с момента ее публикации. Продолжение использования Платформы после обновления документа признается вашим полным и автоматическим согласием с новыми условиями обработки данных."}</p>

          <h2 className="font-bold text-lg text-slate-900 dark:text-white">{isEn ? "13. DISPUTE RESOLUTION AND CONTACTS" : "13. РАЗРЕШЕНИЕ СПОРОВ И КОНТАКТЫ"}</h2>
          <p>{isEn ? "In accordance with the principle of hierarchy (Section 11 of the User Agreement), in the event of any disputes, complaints, or claims related to the processing, leakage, deletion, or alteration of personal data, the Highest Instance, represented by the Founder (Creator) of the Platform, has the exclusive right to a final review of the situation. The Founder's decision is final, absolute, and not subject to internal appeal." : "В соответствии с принципом иерархии (Раздел 11 Пользовательского соглашения), в случае возникновения любых споров, жалоб или претензий, связанных с обработкой, утечкой, удалением или изменением персональных данных, Высшая инстанция в лице Основателя (Учредителя) Платформы имеет исключительное право финального рассмотрения ситуации. Решение Основателя является окончательным, абсолютным и не подлежит внутреннему обжалованию."}</p>
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
             <p className="font-bold mb-2">{isEn ? "For sending official requests for deletion, data export or other privacy matters, the User can contact Support:" : "Для направления официальных запросов на удаление, выгрузку данных или по иным вопросам конфиденциальности, Пользователь может обратиться в службу поддержки:"}</p>
             <p>📧 {isEn ? "Email" : "Электронная почта"} (DPO/Support): <b>association.mun.support@gmail.com</b></p>
             <p className="text-xs text-slate-500 mt-2">{isEn ? "(The standard response time for official requests is 3 to 15 business days)." : "(Установленный срок рассмотрения официальных запросов составляет от 3 до 15 рабочих дней)."}</p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
