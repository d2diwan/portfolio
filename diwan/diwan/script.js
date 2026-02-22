// --- CONFIG ---
const gearConfig = {
    teeth: 16,
    radius: 170, // Slightly smaller than SVG viewbox edge
    depth: 25
};

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if URL has skip-landing parameter
    const urlParams = new URLSearchParams(window.location.search);
    const skipLanding = urlParams.get('skip') === 'true';
    
    if (skipLanding) {
        // Directly show main content without landing animation
        const overlay = document.getElementById('landing-overlay');
        const header = document.querySelector('.blueprint-header');
        const main = document.querySelector('main');
        
        if (overlay) {
            overlay.style.display = 'none';
        }
        if (header) {
            header.classList.remove('hidden-initially');
        }
        if (main) {
            main.classList.remove('hidden-initially');
        }
        
        document.body.classList.remove('no-scroll');
        
        // Scroll to projects if hash exists
        if (window.location.hash) {
            setTimeout(() => {
                const targetId = window.location.hash.substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    } else {
        // Normal landing page behavior
        document.body.classList.add('no-scroll');
        window.scrollTo(0, 0);
        
        initLandingGears();
        initGearSystem();
        initTypingEffect();
        initScrollSystem();
        updateDate();
    }

    // Wire up the Ignite Button
    const igniteBtn = document.getElementById('igniteBtn');
    if (igniteBtn) {
        igniteBtn.addEventListener('click', igniteEngine);
    }
});

// --- LANDING PAGE LOGIC ---
let landingAngle = 0;
let landingSpeed = 0.4;
let landingAnimFrame;

function initLandingGears() {
    // Generate paths for Landing Gears (GearL: 14 teeth, GearS: 9 teeth)
    // Using same generator function
    const pathL = document.getElementById('pathL');
    const pathS = document.getElementById('pathS');

    if (pathL && pathS) {
        pathL.setAttribute('d', generateGearShape(14, 180, 28));
        pathS.setAttribute('d', generateGearShape(9, 115, 28));
        runLandingAnimation();
    }
}

function runLandingAnimation() {
    landingAngle += landingSpeed;

    const gearL = document.getElementById('gearL');
    const gearS = document.getElementById('gearS');

    if (gearL && gearS) {
        // Moved up to Y=240 to avoid button overlap
        gearL.setAttribute('transform', `translate(420, 240) rotate(${landingAngle})`);

        // Mated gear ratio (14/9)
        // Note: Direction is opposite usually, so (-)
        let angleS = -landingAngle * (14 / 9) + (180 / 9);
        gearS.setAttribute('transform', `translate(745, 240) rotate(${angleS})`);
    }

    landingAnimFrame = requestAnimationFrame(runLandingAnimation);
}

function igniteEngine() {
    // 1. Boost Speed
    landingSpeed = 8.0; // Fast spin

    // 2. Wait 1.5s then Fade Out
    setTimeout(() => {
        const overlay = document.getElementById('landing-overlay');
        const header = document.querySelector('.blueprint-header');
        const main = document.querySelector('main');

        if (overlay) {
            overlay.classList.add('fade-out');

            // Stop animation after fade to save resources
            setTimeout(() => {
                cancelAnimationFrame(landingAnimFrame);
                overlay.style.display = 'none';
            }, 1000);
        }

        // 3. Reveal Main Content and Unlock Scroll
        if (header) header.classList.remove('hidden-initially'); // Header can snap, that's fine or fix validly
        if (main) {
            // Do NOT remove 'hidden-initially' so the transition property persists
            main.classList.add('reveal');
        }

        document.body.classList.remove('no-scroll');

        // Force navigation to Home
        window.location.hash = '#home';
        window.scrollTo(0, 0);

    }, 800);
}


// --- MAIN HERO GEAR SYSTEM ---
function initGearSystem() {
    const gearPath = document.getElementById('heroGearPath');
    if (gearPath) {
        gearPath.setAttribute('d', generateGearShape(gearConfig.teeth, gearConfig.radius, gearConfig.depth));
    }

    // Animation Loop
    let angle = 0;
    const gearGroup = document.getElementById('heroGearGroup');

    function animate() {
        angle += 0.2; // Continuous slow rotation
        if (gearGroup) {
            gearGroup.setAttribute('transform', `translate(400, 300) rotate(${angle})`);
        }
        requestAnimationFrame(animate);
    }
    animate();
}

// Generates SVG path data for a gear
function generateGearShape(teeth, r, depth) {
    let points = [];
    const step = (Math.PI * 2) / teeth;

    for (let i = 0; i < teeth; i++) {
        const a = i * step;

        // 4 points per tooth for trapezoidal shape
        const rInner = r;
        const rOuter = r + depth;

        points.push(polarToCartesian(a - step * 0.15, rInner));
        points.push(polarToCartesian(a - step * 0.08, rOuter));
        points.push(polarToCartesian(a + step * 0.08, rOuter));
        points.push(polarToCartesian(a + step * 0.15, rInner));
    }

    // Close the shape
    const d = points.map((p, i) => {
        return (i === 0 ? "M " : "L ") + p.x + "," + p.y;
    }).join(" ") + " Z";

    return d;
}

function polarToCartesian(angle, radius) {
    return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
    };
}

// --- TYPING EFFECT ---
function initTypingEffect() {
    const texts = [
        "MECHANICAL DESIGNER // ROBOTICS AUTOMATION",
        "CAD SPECIALIST // PROTOTYPING"
    ];
    let count = 0;
    let index = 0;
    let currentText = "";
    let letter = "";
    const typingContainer = document.querySelector('.typing-text');

    if (!typingContainer) return;

    (function type() {
        if (count === texts.length) {
            count = 0;
        }
        currentText = texts[count];
        letter = currentText.slice(0, ++index);

        typingContainer.textContent = letter;

        if (letter.length === currentText.length) {
            setTimeout(() => {
                // Erase effect
                let eraseInterval = setInterval(() => {
                    letter = currentText.slice(0, --index);
                    typingContainer.textContent = letter;
                    if (index === 0) {
                        clearInterval(eraseInterval);
                        count++;
                        type();
                    }
                }, 30);
            }, 2000); // Wait before erasing
        } else {
            setTimeout(type, 50);
        }
    })();
}

// --- DATE UPDATE ---
function updateDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    }
}

// --- SMOOTH SCROLL & ACTIVE LINK ---
function initScrollSystem() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-overlay');
            document.body.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-overlay');
                document.body.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-overlay');
                document.body.classList.remove('active');
            }
        });
    }

    // Smooth Scroll
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Active Link Highlighter on Scroll
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Drawing Animation Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.skill-card, .project-entry, .stats-grid, .frame-container').forEach(el => {
        el.classList.add('draw-anim');
        observer.observe(el);
    });

    // Contact Form Handler
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Construct Mailto Link
            const subject = encodeURIComponent(`PORTFOLIO INQUIRY from ${name}`);
            const body = encodeURIComponent(
                `SENDER IDENTITY: ${name}
RETURN ADDRESS: ${email}

DATA PACKET (MESSAGE):
${message}

-----------------------------------
Sent via Diwan's Digital Portfolio`
            );


            // Open Email Client
            const mailtoLink = `mailto:j.diwan2005@gmail.com?subject=${subject}&body=${body}`;

            // Create temporary link to avoid navigation issues
            const tempLink = document.createElement('a');
            tempLink.href = mailtoLink;
            tempLink.click();
            tempLink.remove();

            // Optional: Visual Feedback
            const btn = this.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = "TRANSMISSION INITIATED...";
            setTimeout(() => {
                btn.innerText = originalText;
                contactForm.reset();
            }, 3000);
        });
    }
}
