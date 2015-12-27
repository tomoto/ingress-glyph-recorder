package glyphrecorder.servlets;

import glyphrecorder.dto.SelectOptionDTO;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FilenameFilter;
import java.io.IOException;
import java.text.DateFormat;
import java.text.MessageFormat;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.List;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.collections4.IterableUtils;
import org.apache.commons.collections4.Predicate;
import org.apache.commons.collections4.Transformer;
import org.apache.commons.io.IOCase;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.WildcardFileFilter;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonIOException;
import com.google.gson.JsonSyntaxException;

/**
 * Servlet implementation class TracesServlet
 */
public class TracesServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
	
	private static final String TRACE_DIRECTORY_INIT_PARAM = "traceDirectory";
	private static final String TRACES_FILE_INIT_PARAM = "tracesFile";
	private static final String TRACE_URL_FORMAT = "traces/{0}";

	private File traceDirectory;
	private File unusedTraceDirectory;
	private File tracesFile;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public TracesServlet() {
        super();
        // TODO Auto-generated constructor stub
    }
    
    @Override
    public void init(ServletConfig config) throws ServletException {
    	super.init(config);
    	traceDirectory = new File(config.getInitParameter(TRACE_DIRECTORY_INIT_PARAM));
    	traceDirectory.mkdirs();
    	unusedTraceDirectory = new File(traceDirectory, "unused");
    	unusedTraceDirectory.mkdirs();
    	tracesFile = new File(config.getInitParameter(TRACES_FILE_INIT_PARAM));
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println(request.getRequestURI());
		
		Collection<File> traceFiles = Arrays.asList(traceDirectory.listFiles((FilenameFilter) new WildcardFileFilter("*.json", IOCase.INSENSITIVE)));
		
		if (request.getRequestURI().endsWith("unusedTraces")) {
			traceFiles = extractUnusedTraceFiles(traceFiles);
		}
		
		Collection<SelectOptionDTO> traceFileDTOs = CollectionUtils.collect(traceFiles, new Transformer<File, SelectOptionDTO>() {
			@Override
			public SelectOptionDTO transform(File f) {
				SelectOptionDTO dto = new SelectOptionDTO();
				dto.value = MessageFormat.format(TRACE_URL_FORMAT, f.getName());
				dto.text = f.getName().replace(".json", "");
				return dto;
			}
		});
		
		String json = new GsonBuilder().setPrettyPrinting().create().toJson(traceFileDTOs);
		
		response.setCharacterEncoding("UTF-8");
		response.getWriter().append(json);
	}

	private Collection<File> extractUnusedTraceFiles(Collection<File> traceFiles) throws ServletException {
		try {
			final List<SelectOptionDTO> usedTraceFileDTOs = 
					Arrays.asList(new Gson().fromJson(new FileReader(tracesFile), SelectOptionDTO[].class));
			
			Collection<File> unusedTraceFiles = CollectionUtils.select(traceFiles, new Predicate<File>() {
				@Override
				public boolean evaluate(final File f) {
					return IterableUtils.find(usedTraceFileDTOs, new Predicate<SelectOptionDTO>() {
						@Override
						public boolean evaluate(SelectOptionDTO so) {
							return so.value.contains(f.getName());
						}
					}) == null;
				}
			});
			
			// TODO cleaning up -- should be taken out to an admin command
			for (File f : unusedTraceFiles) {
				f.renameTo(new File(unusedTraceDirectory, f.getName()));
			}
			
			return unusedTraceFiles;
		} catch (Exception e) {
			throw new ServletException("JSON decode error", e);
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		DateFormat df = new SimpleDateFormat("yyyyMMdd-HHmmss");
		String filename = "Trace_" + df.format(new Date()) + ".json";
		FileOutputStream out = new FileOutputStream(new File(traceDirectory, filename));
		IOUtils.copy(request.getInputStream(), out);
		out.close();
	}
}
