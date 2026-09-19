// supabase.js
const SUPABASE_URL = 'https://tgunhsnfgnqcgezlqfoz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndW5oc25mZ25xY2dlemxxZm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk3NDE1MzMsImV4cCI6MjEwNTMxNzUzM30.Wk_ARLcA7Cu8T6PJrm3ICFypNo1aY2OnoTTa-HF-yIw';

if (typeof supabase === 'undefined') {
    console.error('Supabase JS не подключён.');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================================================
   ТЕКУЩИЙ ЯЗЫК
   ============================================================ */
let currentLang = (function () {
    try { return localStorage.getItem('lang') || 'ru'; } catch (e) { return 'ru'; }
})();

function setCurrentLang(lang) {
    currentLang = lang;
    try { localStorage.setItem('lang', lang); } catch (e) { }
    document.documentElement.setAttribute('lang', lang);
}

/* ============================================================
   ХЕЛПЕР: выбрать локализованное значение
   ============================================================ */
function pick(row, field) {
    if (currentLang === 'en') {
        const en = row[field + '_en'];
        if (en != null && en !== '') return en;
    }
    return row[field];
}

/* ============================================================
   КЭШ СЫРЫХ ДАННЫХ
   ============================================================ */
const __cache = {
    projects: null,
    skills: null,
    contacts: null,
    pathNodes: null,
    content: null,
    thoughts: null
};

/** Сбросить кэш = */
function invalidateCache() {
    __cache.projects = null;
    __cache.skills = null;
    __cache.contacts = null;
    __cache.pathNodes = null;
    __cache.content = null;
    __cache.thoughts = null;
}

/* ============================================================
   ЗАГРУЗЧИКИ RAW
   ============================================================ */

async function loadProjectsRaw() {
    if (__cache.projects) return __cache.projects;
    const { data, error } = await supabaseClient
        .from('projects')
        .select('id, title, title_en, subtitle, subtitle_en, description, description_en, year, tags, cover_url, link')
        .eq('is_visible', true)
        .order('id', { ascending: false });

    if (error) { console.error('Ошибка загрузки проектов:', error.message); return []; }
    __cache.projects = data || [];
    return __cache.projects;
}

async function loadSkillsRaw() {
    if (__cache.skills) return __cache.skills;
    const { data, error } = await supabaseClient
        .from('skills')
        .select('id, name, name_en, description, description_en, is_featured')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

    if (error) { console.error('Ошибка загрузки навыков:', error.message); return []; }
    __cache.skills = data || [];
    return __cache.skills;
}

async function loadContactsRaw() {
    if (__cache.contacts) return __cache.contacts;
    const { data, error } = await supabaseClient
        .from('contact_links')
        .select('id, name, name_en, meta, meta_en, href, icon, arrow')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

    if (error) { console.error('Ошибка загрузки контактов:', error.message); return []; }
    __cache.contacts = data || [];
    return __cache.contacts;
}

async function loadPathNodesRaw() {
    if (__cache.pathNodes) return __cache.pathNodes;
    const { data, error } = await supabaseClient
        .from('path_nodes')
        .select('id, year, year_en, title, title_en, subtitle, subtitle_en, position')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

    if (error) { console.error('Ошибка загрузки хроники:', error.message); return []; }
    __cache.pathNodes = data || [];
    return __cache.pathNodes;
}

async function loadContentRaw() {
    if (__cache.content) return __cache.content;
    const { data, error } = await supabaseClient
        .from('site_content')
        .select('key, value, value_en');

    if (error) { console.error('Ошибка загрузки контента:', error.message); return []; }
    __cache.content = data || [];
    return __cache.content;
}

async function loadThoughtsRaw() {
    if (__cache.thoughts) return __cache.thoughts;
    const { data, error } = await supabaseClient
        .from('thoughts')
        .select('id, text, text_en')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

    if (error) { console.error('Ошибка загрузки мыслей:', error.message); return []; }
    __cache.thoughts = data || [];
    return __cache.thoughts;
}

function localizeThoughts(rows) {
    return rows.map(t => ({
        id: t.id,
        text: pick(t, 'text')
    }));
}

async function fetchThoughts() { return localizeThoughts(await loadThoughtsRaw()); }

/* ============================================================
   ЛОКАЛИЗАЦИЯ
   ============================================================ */

function localizeProjects(rows) {
    return rows.map(p => ({
        id: p.id,
        title: pick(p, 'title'),
        subtitle: pick(p, 'subtitle'),
        description: pick(p, 'description'),
        year: p.year,
        tags: p.tags,
        cover_url: p.cover_url,
        link: p.link
    }));
}

function localizeSkills(rows) {
    return rows.map(s => ({
        id: s.id,
        name: pick(s, 'name'),
        description: pick(s, 'description'),
        is_featured: !!s.is_featured
    }));
}

function localizeContacts(rows) {
    return rows.map(c => ({
        id: c.id,
        name: pick(c, 'name'),
        meta: pick(c, 'meta'),
        href: c.href,
        icon: c.icon,
        arrow: c.arrow
    }));
}

function localizePathNodes(rows) {
    return rows.map(n => ({
        id: n.id,
        year: pick(n, 'year'),
        title: pick(n, 'title'),
        subtitle: pick(n, 'subtitle'),
        position: n.position
    }));
}

function localizeContent(rows) {
    const map = {};
    rows.forEach(row => { map[row.key] = pick(row, 'value'); });
    return map;
}

/* ============================================================
   ПУБЛИЧНЫЕ ЗАГРУЗЧИКИ
   ============================================================ */

async function fetchProjects() { return localizeProjects(await loadProjectsRaw()); }
async function fetchSkills() { return localizeSkills(await loadSkillsRaw()); }
async function fetchContacts() { return localizeContacts(await loadContactsRaw()); }
async function fetchPathNodes() { return localizePathNodes(await loadPathNodesRaw()); }
async function fetchContent() { return localizeContent(await loadContentRaw()); }